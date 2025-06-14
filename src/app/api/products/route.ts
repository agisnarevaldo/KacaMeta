import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { $Enums } from '@/generated/prisma'
import { uploadImage } from '@/lib/server-utils'

type ProductStatus = $Enums.ProductStatus

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const slug = searchParams.get('slug')
    const includeDiscontinued = searchParams.get('includeDiscontinued') === 'true'

    const where: any = {}

    if (category && category !== 'all') {
      where.category = {
        slug: category
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    }

    if (slug) {
      where.slug = slug
    }

    if (status) {
      where.status = status as ProductStatus
    } else if (!includeDiscontinued) {
      // By default, exclude discontinued products for public API
      where.status = {
        not: 'DISCONTINUED'
      }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.role) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, price, stock, categoryId, badge, status, images } = body

    // Validate required fields
    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this name already exists' },
        { status: 400 }
      )
    }

    // Handle image upload
    let imageUrl = null
    if (images && images.length > 0) {
      imageUrl = await uploadImage(images[0])
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        categoryId: parseInt(categoryId),
        badge,
        status: status as ProductStatus || 'AVAILABLE',
        images: imageUrl ? imageUrl : null
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

// PUT /api/products - Update existing product (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.role) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, name, description, price, stock, categoryId, badge, status, images } = body

    // Validate required fields
    if (!id || !name || !price || !categoryId) {
      return NextResponse.json(
        { error: 'ID, name, price, and category are required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Handle image upload
    let imageUrl = null
    if (images && images.length > 0) {
      imageUrl = await uploadImage(images[0])
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        categoryId: parseInt(categoryId),
        badge,
        status: status as ProductStatus || 'AVAILABLE',
        images: imageUrl ? imageUrl : null
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}
