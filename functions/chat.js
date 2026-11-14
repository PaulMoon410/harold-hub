// Base44 backend function for Harold chat with FTP integration
// This runs in Base44's managed Deno runtime

export default async (req: Request) => {
  const { message, history, sessionId } = await req.json();

  if (!message) {
    return new Response(JSON.stringify({ error: 'Message is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check if message is about file operations
  const lower = message.toLowerCase();
  let response = '';

  if (lower.includes('list files') || lower.includes('what files')) {
    response = await handleListFiles();
  } else if (lower.includes('search') && lower.includes('file')) {
    response = await handleSearchFiles(message);
  } else if (lower.includes('upload')) {
    response = handleUploadInstructions();
  } else if (lower.includes('download')) {
    response = handleDownloadInstructions();
  } else if (lower.includes('delete') || lower.includes('remove')) {
    response = handleDeleteInstructions();
  } else {
    response = generateHaroldResponse(message, history);
  }

  // Save conversation to Base44 database
  await saveConversation(sessionId, message, response);

  return new Response(JSON.stringify({ response }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

function generateHaroldResponse(message: string, history: any[]): string {
  const lower = message.toLowerCase();

  if (lower.includes('hello') || lower.includes('hi')) {
    return "Hello! I'm Harold, your AI assistant with file management capabilities. How can I help you today?";
  }
  if (lower.includes('how are you')) {
    return "I'm just a program, but I'm functioning perfectly! How about you?";
  }
  if (lower.includes('name')) {
    return "I'm Harold, your AI assistant. I can help with chat and file management!";
  }
  if (lower.includes('help')) {
    return "I'm here to help! You can ask me questions, request information, or manage files. Try saying 'list files' or 'search for [filename]'";
  }
  if (lower.includes('cool') || lower.includes('awesome') || lower.includes('great')) {
    return "Yes! With the FTP server integration, I can help you manage files remotely. It's pretty cool!";
  }

  const responses = [
    "That's interesting! Tell me more.",
    "I understand. What else would you like to discuss?",
    "Thanks for sharing that with me.",
    "I'm here to help with whatever you need. I can also manage files if you ask!",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

async function handleListFiles(): Promise<string> {
  try {
    // Call FTP server API
    const ftpApiUrl = process.env.FTP_API_URL || 'http://localhost:3000/api/ftp/files';
    const response = await fetch(ftpApiUrl);
    const data = await response.json();
    
    if (data.success && data.files.length > 0) {
      const fileList = data.files.map(f => 
        `${f.isDirectory() ? '📁' : '📄'} ${f.name} (${f.size} bytes)`
      ).join('\n');
      return `Here are the files in the FTP server:\n\n${fileList}`;
    }
    
    return "No files found in the FTP server.";
  } catch (error) {
    return "I couldn't access the FTP server. Please check the connection.";
  }
}

async function handleSearchFiles(message: string): Promise<string> {
  const pattern = message.replace(/search.*for/i, '').trim();
  if (!pattern) {
    return "What would you like to search for?";
  }

  try {
    const ftpApiUrl = process.env.FTP_API_URL || 'http://localhost:3000/api/ftp/search';
    const response = await fetch(`${ftpApiUrl}?pattern=${encodeURIComponent(pattern)}`);
    const data = await response.json();
    
    if (data.success && data.files.length > 0) {
      const fileList = data.files.map(f => 
        `${f.isDirectory() ? '📁' : '📄'} ${f.name}`
      ).join('\n');
      return `Found ${data.files.length} file(s) matching "${pattern}":\n\n${fileList}`;
    }
    
    return `No files found matching "${pattern}".`;
  } catch (error) {
    return "I couldn't search the FTP server. Please check the connection.";
  }
}

function handleUploadInstructions(): string {
  return "To upload a file, use the file upload API or say 'upload [filename] with [content]'. I'll handle the rest!";
}

function handleDownloadInstructions(): string {
  return "To download a file, use the download API or say 'download [filename]'. I'll retrieve it for you!";
}

function handleDeleteInstructions(): string {
  return "To delete a file, use the delete API or say 'delete [filename]'. I'll remove it for you!";
}

async function saveConversation(sessionId: string, userMessage: string, botResponse: string) {
  // Placeholder for Base44 database save
  console.log('Saving conversation:', { sessionId, userMessage, botResponse });
}