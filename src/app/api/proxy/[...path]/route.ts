import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Route segment config for Next.js 15+
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'DELETE');
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join('/');
    const url = `${BACKEND_URL}/${path}`;
    
    console.log(`[PROXY] ${method} ${url}`);
    
    const contentType = request.headers.get('content-type') || '';
    
    // Handle multipart/form-data (file uploads)
    if (contentType.includes('multipart/form-data')) {
      console.log('[PROXY] Handling file upload (multipart/form-data)');
      
      // Get the form data
      const formData = await request.formData();
      
      // Prepare headers (don't set Content-Type, fetch will set it with boundary)
      const headers: Record<string, string> = {};
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        headers['Authorization'] = authHeader;
      }

      console.log('[PROXY] Forwarding form data to backend...');
      
      const response = await fetch(url, {
        method,
        headers,
        body: formData, // Forward the FormData directly
      });

      console.log(`[PROXY] Backend responded with status: ${response.status}`);

      const responseText = await response.text();
      console.log('[PROXY] Response:', responseText.substring(0, 200));

      return new NextResponse(responseText, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'application/json',
        },
      });
    }
    
    // Handle JSON requests
    let body: string | undefined = undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        const text = await request.text();
        if (text) {
          body = text;
          console.log('[PROXY] Request body:', text.substring(0, 100));
        }
      } catch (e) {
        console.error('[PROXY] Error reading request body:', e);
      }
    }

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Copy authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    console.log('[PROXY] Sending request to backend...');
    
    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    console.log(`[PROXY] Backend responded with status: ${response.status}`);

    // Get response body
    const responseText = await response.text();
    console.log('[PROXY] Response body:', responseText.substring(0, 100));

    // Return response with same status
    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[PROXY] Error:', error);
    return NextResponse.json(
      { detail: `Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
