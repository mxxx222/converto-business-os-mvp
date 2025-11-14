import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const documentType = searchParams.get('document_type');
    const search = searchParams.get('search');
    
    // Build query
    let query = supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (documentType) {
      query = query.eq('document_type', documentType);
    }
    
    if (search) {
      query = query.or(`vendor.ilike.%${search}%,y_tunnus.ilike.%${search}%,file_name.ilike.%${search}%`);
    }
    
    // Execute query
    const { data: documents, error: queryError, count } = await query;
    
    if (queryError) {
      console.error('Query error:', queryError);
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    }
    
    return NextResponse.json({
      documents: documents || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit,
      }
    });
    
  } catch (error) {
    console.error('List documents error:', error);
    return NextResponse.json(
      { error: 'Failed to list documents' },
      { status: 500 }
    );
  }
}

