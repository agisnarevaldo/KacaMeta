import { NextRequest, NextResponse } from 'next/server'
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

    // Get statistics
    const [
      totalProducts,
      totalStock,
      lowStockProducts,
      outOfStockProducts,
      totalCategories,
      totalOrders
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
      prisma.order.count()
    ])

    const stats = {
      totalProducts,
      totalStock: totalStock._sum.stock || 0,
      lowStockProducts,
      outOfStockProducts,
      totalCategories,
      totalOrders
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
