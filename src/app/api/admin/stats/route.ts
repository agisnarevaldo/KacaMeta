import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET /api/admin/stats - Get dashboard statistics (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.role) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current date ranges for analytics
    const now = new Date()
    const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastWeekEnd = new Date(thisWeekStart.getTime() - 1)

    // Get statistics
    const [
      totalProducts,
      totalStock,
      lowStockProducts,
      outOfStockProducts,
      totalCategories,
      totalOrders,
      recentOrders,
      thisWeekOrders,
      lastWeekOrders,
      topCategories,
      recentProducts
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.aggregate({
        _sum: {
          stock: true
        }
      }),
      prisma.product.count({
        where: {
          stock: {
            lt: 10,
            gt: 0
          }
        }
      }),
      prisma.product.count({
        where: {
          status: 'OUT_OF_STOCK'
        }
      }),
      prisma.category.count(),
      prisma.order.count(),
      // Recent orders for activity feed
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          customer: true,
          orderItems: {
            include: {
              product: true
            }
          }
        }
      }),
      // This week's orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: thisWeekStart
          }
        }
      }),
      // Last week's orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: lastWeekStart,
            lte: lastWeekEnd
          }
        }
      }),
      // Top categories by product count
      prisma.category.findMany({
        include: {
          _count: {
            select: { products: true }
          }
        },
        orderBy: {
          products: {
            _count: 'desc'
          }
        },
        take: 5
      }),
      // Recent products for activity feed
      prisma.product.findMany({
        take: 3,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          category: true
        }
      })
    ])

    // Calculate growth percentage
    const orderGrowth = lastWeekOrders > 0 
      ? ((thisWeekOrders - lastWeekOrders) / lastWeekOrders * 100).toFixed(1)
      : '0'

    // Generate recent activities from real data
    const recentActivities = []
    
    // Add recent orders to activities
    recentOrders.slice(0, 2).forEach((order) => {
      const productName = order.orderItems[0]?.product?.name || 'produk'
      recentActivities.push({
        id: `order-${order.id}`,
        type: 'order',
        message: `Pesanan baru dari ${order.customer.name} untuk ${productName}`,
        timestamp: getRelativeTime(order.createdAt),
        status: 'success'
      })
    })

    // Add recent products to activities
    recentProducts.slice(0, 2).forEach((product) => {
      recentActivities.push({
        id: `product-${product.id}`,
        type: 'product',
        message: `Produk baru "${product.name}" berhasil ditambahkan`,
        timestamp: getRelativeTime(product.createdAt),
        status: 'success'
      })
    })

    // Add stock alerts
    if (lowStockProducts > 0) {
      recentActivities.push({
        id: 'stock-alert',
        type: 'stock',
        message: `${lowStockProducts} produk memiliki stok rendah`,
        timestamp: '1 jam yang lalu',
        status: 'warning'
      })
    }

    if (outOfStockProducts > 0) {
      recentActivities.push({
        id: 'out-of-stock-alert',
        type: 'stock',
        message: `${outOfStockProducts} produk habis stok`,
        timestamp: '2 jam yang lalu',
        status: 'error'
      })
    }

    const stats = {
      totalProducts,
      totalStock: totalStock._sum.stock || 0,
      lowStockProducts,
      outOfStockProducts,
      totalCategories,
      totalOrders,
      orderGrowth: orderGrowth,
      thisWeekOrders,
      topCategories,
      recentActivities: recentActivities.slice(0, 4)
    }

    // Helper function to get relative time
    function getRelativeTime(date: Date): string {
      const now = new Date()
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      
      if (diffInMinutes < 1) return 'Baru saja'
      if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`
      
      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) return `${diffInHours} jam yang lalu`
      
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} hari yang lalu`
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
