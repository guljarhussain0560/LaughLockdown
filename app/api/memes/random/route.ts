import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '10');

    // Get total count of approved memes
    const totalMemes = await prisma.meme.count({
      where: { isApproved: true },
    });

    if (totalMemes === 0) {
      return NextResponse.json({ memes: [] });
    }

    // Generate random skip values and fetch memes
    const randomMemes = [];
    const usedIndexes = new Set<number>();

    for (let i = 0; i < Math.min(count, totalMemes); i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * totalMemes);
      } while (usedIndexes.has(randomIndex));
      
      usedIndexes.add(randomIndex);

      const meme = await prisma.meme.findFirst({
        where: { isApproved: true },
        skip: randomIndex,
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

      if (meme) {
        randomMemes.push(meme);
        
        // Update usage count
        await prisma.meme.update({
          where: { id: meme.id },
          data: { usageCount: { increment: 1 } },
        });
      }
    }

    return NextResponse.json({ memes: randomMemes });
  } catch (error) {
    console.error('Fetch random memes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random memes' },
      { status: 500 }
    );
  }
}
