import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Resource from '@/models/Resource';
import Complaint from '@/models/Complaint';
import { NextResponse } from 'next/server';

const STATIC_FAQS = [
  { keywords: ['study material', 'notes', 'syllabus', 'resources', 'books'], response: 'You can find all study materials, notes, and the syllabus in the **Resources** section. \n\nDirect link: **/resources**' },
  { keywords: ['feedback', 'faculty', 'professor', 'rating', 'teacher'], response: 'To provide feedback for your faculty, please visit the **Faculty Feedback** portal. It is completely anonymous. \n\nDirect link: **/feedback**' },
  { keywords: ['attendance', 'present', 'absent', 'track'], response: 'You can track your daily attendance and see your percentage in the **Attendance** module. \n\nDirect link: **/attendance**' },
  { keywords: ['complaint', 'grievance', 'issue', 'problem', 'complain'], response: 'If you have any issues or complaints, you can file them anonymously in the **Grievance** section. \n\nDirect link: **/complaints**' },
  { keywords: ['event', 'calendar', 'holiday', 'exam', 'schedule'], response: 'Stay updated with college events and exam schedules using our **Event Calendar**. \n\nDirect link: **/calendar**' }
];

export async function POST(request) {
  await dbConnect();
  const { message, history, userContext } = await request.json();
  const lowerMessage = message.toLowerCase();
  const userName = userContext?.name || 'there';
  const userRole = userContext?.role || 'guest';

  const getSystemStats = async () => {
    try {
      const [studentCount, resourceCount, pendingComplaints] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        Resource.countDocuments(),
        Complaint.countDocuments({ status: 'pending' }),
      ]);
      return { studentCount, resourceCount, pendingComplaints };
    } catch {
      return { studentCount: 'N/A', resourceCount: 'N/A', pendingComplaints: 'N/A' };
    }
  };

  if (lowerMessage.match(/\b(hi|hello|hey|hola)\b/)) {
    return NextResponse.json({
      message: `Hello ${userName}! I'm the **College 360 Logic Core**. How can I help you navigate the system today?`
    });
  }

  if (lowerMessage.includes('how many') || lowerMessage.includes('stats') || lowerMessage.includes('count') || lowerMessage.includes('status')) {
    const stats = await getSystemStats();
    if (lowerMessage.includes('student')) {
      return NextResponse.json({ message: `There are currently **${stats.studentCount} students** registered in our digital campus registry.` });
    }
    if (lowerMessage.includes('resource') || lowerMessage.includes('material') || lowerMessage.includes('note')) {
      return NextResponse.json({ message: `I've found **${stats.resourceCount} academic assets** (notes, syllabus, materials) available in the library.` });
    }
    if (lowerMessage.includes('complaint') || lowerMessage.includes('issue') || lowerMessage.includes('grievance')) {
      return NextResponse.json({ message: `The administration currently has **${stats.pendingComplaints} pending grievances** under review.` });
    }
  }

  const navMap = {
    'attendance': '/attendance', 'resource': '/resources', 'material': '/resources',
    'notes': '/resources', 'syllabus': '/resources', 'feedback': '/feedback',
    'complaint': '/complaints', 'grievance': '/complaints', 'event': '/calendar',
    'calendar': '/calendar', 'student': '/manage-students', 'dashboard': '/dashboard'
  };

  for (const [key, path] of Object.entries(navMap)) {
    if (lowerMessage.includes(key)) {
      if (key === 'student' && userRole !== 'admin') continue;
      return NextResponse.json({
        message: `I can help you with that. Visit the **${key.charAt(0).toUpperCase() + key.slice(1)}** module here: \n\nDirect Link: **${path}**`
      });
    }
  }

  for (const faq of STATIC_FAQS) {
    if (faq.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return NextResponse.json({ message: faq.response });
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'place_your_api_keys' && !apiKey.startsWith('MOCK')) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const stats = await getSystemStats();
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: `You are the "College 360 AI Assistant".
        Current User: ${userName} (${userRole}).
        System Stats: ${stats.studentCount} students, ${stats.resourceCount} resources, ${stats.pendingComplaints} complaints.
        Guidelines:
        - Use real-time stats if asked.
        - Direct users to paths like /attendance, /resources, etc.
        - Tone: Sophisticated, technical, yet helpful.`
      });

      const chat = model.startChat({
        history: (history || []).map(h => ({
          role: h.role === 'bot' ? 'model' : h.role,
          parts: [{ text: h.parts[0].text }]
        })),
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      return NextResponse.json({ message: response.text() });
    } catch (error) {
      console.error('[Chat] Gemini Fallback Error:', error.message);
    }
  }

  return NextResponse.json({
    message: `I'm analyzing your request, ${userName}, but I couldn't find a direct campus link. Try asking about **Attendance**, **Resources**, or **Feedback**!`
  });
}
