import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import { verifySession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('veritrust_session')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const session = await verifySession(token)

    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { newPassword, confirmPassword } = body

    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Both password fields are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Hash the password directly with bcryptjs
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await connectDB()

    const updatedUser = await User.findByIdAndUpdate(
      session.userId,
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      },
      { new: true }
    )

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    console.error('POST /api/auth/password error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to change password' },
      { status: 500 }
    )
  }
}