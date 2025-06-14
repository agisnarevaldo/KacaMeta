import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { $Enums } from '@/generated/prisma'
import { uploadImage } from '@/lib/server-utils'

type ProductStatus = $Enums.ProductStatus

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id)

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update product (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.role) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const productId = parseInt(params.id)
    const body = await request.json()
    const { name, description, price, stock, categoryId, badge, status, images } = body

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Generate new slug if name changed
    let slug = existingProduct.slug
    if (name && name !== existingProduct.name) {
      slug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Check if new slug already exists
      const slugExists = await prisma.product.findFirst({
        where: { 
          slug,
          id: { not: productId }
        }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Product with this name already exists' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (name !== undefined) {
      updateData.name = name
      updateData.slug = slug
    }
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = parseFloat(price)
    if (stock !== undefined) updateData.stock = parseInt(stock)
    if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId)
    if (badge !== undefined) updateData.badge = badge
    if (status !== undefined) updateData.status = status as ProductStatus
    
    // Handle image upload
    if (images !== undefined) {
      if (images && images.length > 0 && typeof images[0] === 'string' && images[0].startsWith('data:')) {
        // New image uploaded - process base64
        const imageUrl = await uploadImage(images[0])
        updateData.images = imageUrl
      } else if (images && images.length > 0) {
        // Existing image URL
        updateData.images = images[0]
      } else {
        // No image or image removed
        updateData.images = null
      }
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
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

// DELETE /api/products/[id] - Delete product (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.role) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const productId = parseInt(params.id)

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        orderItems: true
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if product has been ordered (has order items)
    if (existingProduct.orderItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product that has been ordered. Consider marking it as discontinued instead.' },
        { status: 400 }
      )
    }

    await prisma.product.delete({
      where: { id: productId }
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
