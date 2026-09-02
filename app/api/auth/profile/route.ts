import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import { verifySession } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('veritrust_session')?.value

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not authenticated',
        },
        { status: 401 }
      )
    }

    const session = await verifySession(token)

    if (!session || !session.userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired session',
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { firstName, lastName, organization } = body

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'First name and last name are required',
        },
        { status: 400 }
      )
    }

    await connectDB()

    const updatedUser = await User.findByIdAndUpdate(
      session.userId,
      {
        $set: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          organization: organization?.trim() || 'VeriTrust',
        },
      },
      { new: true }
    )
      .select('-password')
      .lean()

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id.toString(),
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        organization: updatedUser.organization,
        email: updatedUser.email,
        provider: updatedUser.provider,
      },
    })
  } catch (error) {
    console.error('PUT /api/auth/profile error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update profile',
      },
      { status: 500 }
    )
  }
}