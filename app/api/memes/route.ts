import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Size limits in bytes
const SIZE_LIMITS = {
  image: 100 * 1024, // 100KB
  gif: 300 * 1024, // 300KB
  video: 1024 * 1024, // 1MB
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const title = formData.get('title') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    const sizeLimit = SIZE_LIMITS[type as keyof typeof SIZE_LIMITS];
    if (file.size > sizeLimit) {
      return NextResponse.json(
        { error: `File size exceeds ${sizeLimit / 1024}KB limit` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<{
      secure_url: string;
      public_id: string;
      bytes: number;
      width: number;
      height: number;
      duration?: number;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'laughlockdown/memes',
          resource_type: type === 'video' ? 'video' : 'image',
          transformation: [
            // Additional optimization
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result as any);
          else reject(new Error('Upload failed'));
        }
      );
      uploadStream.end(buffer);
    });

    // Save to database
    const meme = await prisma.meme.create({
      data: {
        userId: user.id,
        title: title || null,
        url: result.secure_url,
        publicId: result.public_id,
        type,
        fileSize: result.bytes,
        width: result.width,
        height: result.height,
        duration: result.duration || null,
      },
    });

    return NextResponse.json({
      success: true,
      meme,
      message: 'Meme uploaded successfully!',
    });
  } catch (error) {
    console.error('Meme upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload meme' },
      { status: 500 }
    );
  }
}

// GET - Fetch user's memes or all approved memes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    let memes;

    if (userId) {
      // Get specific user's memes
      memes = await prisma.meme.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      });
    } else {
      // Get all approved memes for games
      memes = await prisma.meme.findMany({
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      });
    }

    return NextResponse.json({ memes });
  } catch (error) {
    console.error('Fetch memes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memes' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a meme
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memeId = searchParams.get('id');

    if (!memeId) {
      return NextResponse.json({ error: 'Meme ID required' }, { status: 400 });
    }

    // Get meme
    const meme = await prisma.meme.findUnique({
      where: { id: memeId },
      include: { user: true },
    });

    if (!meme) {
      return NextResponse.json({ error: 'Meme not found' }, { status: 404 });
    }

    // Check ownership
    if (meme.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(meme.publicId, {
      resource_type: meme.type === 'video' ? 'video' : 'image',
    });

    // Delete from database
    await prisma.meme.delete({
      where: { id: memeId },
    });

    return NextResponse.json({
      success: true,
      message: 'Meme deleted successfully',
    });
  } catch (error) {
    console.error('Delete meme error:', error);
    return NextResponse.json(
      { error: 'Failed to delete meme' },
      { status: 500 }
    );
  }
}
