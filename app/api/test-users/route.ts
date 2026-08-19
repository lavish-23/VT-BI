import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

export async function GET() {
  try {
    await connectDB()

    const users = await User.find({})
      .select('-password')
      .lean()

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    })
  } catch (error) {
    console.error('Test users error:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch users',
      },
      { status: 500 }
    )
  }
}