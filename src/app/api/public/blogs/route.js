// src/app/api/public/blogs/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('query') || '';
    const tag = searchParams.get('tag') || '';
    const authorType = searchParams.get('authorType') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'recent';

    const skip = (page - 1) * limit;

    // Build search filter - only return published blogs
    const searchFilter = {
      status: 'published'
    };
    
    if (query) {
      searchFilter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
      ];
    }

    if (tag) {
      searchFilter.tags = { $regex: tag, $options: 'i' };
    }

    if (authorType) {
      searchFilter.authorType = authorType;
    }

    // Determine sort order
    let sortOption = {};
    if (sort === 'recent') {
      sortOption = { publishedAt: -1 };
    } else if (sort === 'popular') {
      sortOption = { views: -1 };
    } else if (sort === 'likes') {
      sortOption = { likes: -1 };
    }

    const { db } = await connectToDatabase();
    
    const total = await db.collection('blogs').countDocuments(searchFilter);
    
    const blogs = await db.collection('blogs')
      .find(searchFilter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Populate author information for each blog
    const blogsWithAuthor = await Promise.all(blogs.map(async (blog) => {
      let authorInfo;
      
      if (blog.authorType === 'provider') {
        authorInfo = await db.collection('providers').findOne(
          { userId: blog.author },
          { projection: { businessName: 1, specialties: 1, location: 1 } }
        );
      } else {
        // For product sellers, get the user info directly
        authorInfo = await db.collection('users').findOne(
          { _id: blog.author },
          { projection: { name: 1 } }
        );
      }
      
      return {
        ...blog,
        author: authorInfo
      };
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        blogs: blogsWithAuthor,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}