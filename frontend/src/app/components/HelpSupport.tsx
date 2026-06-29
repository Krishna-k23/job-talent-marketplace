// HelpSupport.tsx
import { useState } from 'react';
import { 
  Search, MessageCircle, FileText, Video, BookOpen, 
  ChevronRight, ExternalLink, ThumbsUp, ThumbsDown,
  Clock, CheckCircle, AlertCircle, ArrowLeft, Send,
  Mail, Phone, Globe, Users, Star, Award, Zap,
  HelpCircle
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  views: number;
  helpful: number;
  date: string;
  tags: string[];
  author: {
    name: string;
    role: string;
    avatar: string;
  };
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  lastUpdated: string;
  messages: number;
}

export function HelpSupport() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'articles' | 'faq' | 'tickets'>('articles');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  // Dummy articles data
  const articles: HelpArticle[] = [
    {
      id: '1',
      title: 'Getting Started with BenchAstra',
      category: 'Basics',
      excerpt: 'Learn how to set up your account and start managing your legal research efficiently.',
      content: `Welcome to BenchAstra! This guide will help you get started with our platform.

## Quick Setup Steps

1. **Complete Your Profile**: Add your practice areas and preferences
2. **Connect Your Calendar**: Sync with Google Calendar or Outlook
3. **Explore the Dashboard**: Get familiar with your research dashboard
4. **Set Up Notifications**: Configure email and in-app notifications

## Key Features to Explore

- **AI-Powered Search**: Use natural language to find cases and precedents
- **Case Management**: Organize and track your cases efficiently
- **Collaboration Tools**: Share findings with your team members
- **Document Analysis**: Upload and analyze legal documents automatically

Pro Tip: Start with the "Search" feature to experience the power of our AI technology.`,
      views: 1245,
      helpful: 98,
      date: '2024-01-15',
      tags: ['getting-started', 'onboarding', 'basics'],
      author: {
        name: 'Sarah Johnson',
        role: 'Product Manager',
        avatar: 'SJ'
      }
    },
    {
      id: '2',
      title: 'Understanding AI-Powered Legal Research',
      category: 'AI Features',
      excerpt: 'Deep dive into how our AI algorithms help you find relevant cases and precedents faster.',
      content: `Our AI-powered legal research tool uses advanced machine learning algorithms to understand the context of your queries.

## How It Works

1. **Natural Language Processing**: The AI understands legal terminology and context
2. **Semantic Search**: Finds cases based on meaning, not just keywords
3. **Relevance Ranking**: Results are ranked by relevance to your specific query
4. **Continuous Learning**: The AI improves with every search

## Best Practices

- Use specific legal terms for better results
- Include jurisdiction information when needed
- Review AI-generated summaries for accuracy
- Use filters to narrow down results

The AI is designed to assist, not replace, your legal expertise. Always verify important findings.`,
      views: 876,
      helpful: 92,
      date: '2024-01-10',
      tags: ['ai', 'research', 'technology'],
      author: {
        name: 'Dr. Michael Chen',
        role: 'AI Research Lead',
        avatar: 'MC'
      }
    },
    {
      id: '3',
      title: 'Managing Your Requirements Effectively',
      category: 'Requirements',
      excerpt: 'Learn how to create, track, and manage legal requirements using BenchAstra.',
      content: `Requirements management is crucial for successful legal case handling.

## Creating Requirements

1. **Define Clear Objectives**: What needs to be accomplished?
2. **Set Priorities**: Use our priority system (High, Medium, Low)
3. **Add Deadlines**: Keep track of important dates
4. **Assign Team Members**: Distribute work efficiently

## Tracking Progress

- Use the Requirements Dashboard for overview
- Update status regularly (In Progress, Completed, Blocked)
- Add comments and attachments for context
- Set up automated reminders for deadlines

## Best Practices

- Review requirements weekly
- Communicate changes to team members
- Document all decisions and changes
- Use templates for recurring requirements`,
      views: 534,
      helpful: 87,
      date: '2024-01-05',
      tags: ['requirements', 'management', 'workflow'],
      author: {
        name: 'Emily Rodriguez',
        role: 'Legal Operations Manager',
        avatar: 'ER'
      }
    },
    {
      id: '4',
      title: 'Billing and Subscription Management',
      category: 'Billing',
      excerpt: 'Understanding your subscription plans, billing cycles, and payment options.',
      content: `BenchAstra offers flexible subscription plans to suit different needs.

## Subscription Plans

- **Starter**: $49/month - Basic features for individual lawyers
- **Pro**: $99/month - Advanced AI features for law firms
- **Enterprise**: Custom pricing - Full suite with dedicated support

## Billing Cycle

- Monthly subscriptions: Billed on the 1st of each month
- Annual subscriptions: 20% discount with yearly billing
- Payment methods: Credit cards, bank transfers, PayPal

## Managing Your Account

1. **View Invoices**: Access all past invoices
2. **Update Payment Method**: Change your credit card or billing info
3. **Upgrade/Downgrade**: Adjust your plan as needed
4. **Cancel Subscription**: Manage your account preferences

Need help? Contact our billing team at billing@benchastra.com`,
      views: 412,
      helpful: 79,
      date: '2024-01-01',
      tags: ['billing', 'subscription', 'payment'],
      author: {
        name: 'David Park',
        role: 'Finance Director',
        avatar: 'DP'
      }
    },
    {
      id: '5',
      title: 'Collaboration Tools and Team Features',
      category: 'Collaboration',
      excerpt: 'Work effectively with your team using our collaboration features.',
      content: `BenchAstra provides robust collaboration tools to enhance team productivity.

## Team Features

1. **Shared Workspaces**: Create workspaces for different cases
2. **Real-time Comments**: Discuss cases within the platform
3. **Task Assignment**: Delegate tasks to team members
4. **Activity Tracking**: See who did what and when

## Communication Tools

- **In-app Chat**: Instant messaging with team members
- **Mentions**: @mention team members in comments
- **Notifications**: Stay updated on team activities
- **Shared Calendars**: Coordinate schedules and deadlines

## Best Practices

- Set clear roles and responsibilities
- Use comments for documentation
- Regular team sync meetings
- Maintain organized workspaces`,
      views: 389,
      helpful: 82,
      date: '2023-12-20',
      tags: ['collaboration', 'teams', 'communication'],
      author: {
        name: 'Lisa Thompson',
        role: 'Product Designer',
        avatar: 'LT'
      }
    },
    {
      id: '6',
      title: 'Troubleshooting Common Issues',
      category: 'Troubleshooting',
      excerpt: 'Solutions to common problems you might encounter while using BenchAstra.',
      content: `Find solutions to common issues here. If your problem isn't listed, contact our support team.

## Common Issues and Solutions

### Login Problems
- **Forgot Password**: Use the "Forgot Password" link
- **Account Locked**: Contact support for unlocking
- **Two-Factor Authentication**: Check your authenticator app

### Performance Issues
- **Slow Loading**: Clear browser cache and cookies
- **Search Not Working**: Try simpler search terms
- **App Crashing**: Update to the latest version

### Feature-Specific Issues
- **Search Returns No Results**: Check your search filters
- **Upload Failing**: Verify file format and size limits
- **Collaboration Not Syncing**: Check internet connection

### Still Need Help?
Our support team is available 24/7. Contact us at support@benchastra.com or use the live chat feature.`,
      views: 298,
      helpful: 74,
      date: '2023-12-15',
      tags: ['troubleshooting', 'support', 'issues'],
      author: {
        name: 'James Wilson',
        role: 'Technical Support Lead',
        avatar: 'JW'
      }
    }
  ];

  // Dummy FAQ data
  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I reset my password?',
      answer: 'You can reset your password by clicking on the "Forgot Password" link on the login page. You will receive a password reset link via email. Follow the instructions to create a new password.',
      category: 'Account'
    },
    {
      id: '2',
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time from your Billing settings. Your subscription will remain active until the end of your current billing cycle.',
      category: 'Billing'
    },
    {
      id: '3',
      question: 'Is my data secure?',
      answer: 'Yes, we take data security very seriously. We use industry-standard encryption (AES-256) for all data at rest and in transit. We are also SOC 2 Type II compliant and undergo regular security audits.',
      category: 'Security'
    },
    {
      id: '4',
      question: 'How does the AI search work?',
      answer: 'Our AI search uses natural language processing and machine learning to understand the context of your queries. It goes beyond keyword matching to find relevant cases, precedents, and legal documents based on meaning and relevance.',
      category: 'AI Features'
    },
    {
      id: '5',
      question: 'Can I have multiple team members?',
      answer: 'Yes! Our Pro and Enterprise plans support multiple team members. You can add team members from the Settings > Team Management section.',
      category: 'Teams'
    },
    {
      id: '6',
      question: 'What file formats are supported for upload?',
      answer: 'We support PDF, DOCX, TXT, and RTF file formats. The maximum file size is 50MB per document.',
      category: 'Documentation'
    }
  ];

  // Dummy support tickets
  const tickets: SupportTicket[] = [
    {
      id: 'T-001',
      subject: 'Unable to upload PDF files',
      status: 'in-progress',
      priority: 'high',
      lastUpdated: '2024-01-20',
      messages: 5
    },
    {
      id: 'T-002',
      subject: 'Question about billing cycle',
      status: 'resolved',
      priority: 'medium',
      lastUpdated: '2024-01-18',
      messages: 3
    },
    {
      id: 'T-003',
      subject: 'Feature request: Dark mode toggle',
      status: 'open',
      priority: 'low',
      lastUpdated: '2024-01-16',
      messages: 2
    },
    {
      id: 'T-004',
      subject: 'API integration help needed',
      status: 'closed',
      priority: 'medium',
      lastUpdated: '2024-01-14',
      messages: 7
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'closed': return 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400';
      default: return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'open': return <AlertCircle size={14} />;
      case 'in-progress': return <Clock size={14} />;
      case 'resolved': return <CheckCircle size={14} />;
      case 'closed': return <CheckCircle size={14} />;
      default: return null;
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedArticle) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Help Center</span>
          </button>

          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full mb-3">
                  {selectedArticle.category}
                </span>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {selectedArticle.title}
                </h1>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Clock size={14} />
                <span>{new Date(selectedArticle.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                {selectedArticle.author.avatar}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {selectedArticle.author.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedArticle.author.role}
                </div>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none mb-6">
              {selectedArticle.content.split('\n').map((paragraph, index) => {
                if (paragraph.startsWith('## ')) {
                  return <h2 key={index} className="text-xl font-bold mt-6 mb-3">{paragraph.slice(3)}</h2>;
                } else if (paragraph.startsWith('### ')) {
                  return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{paragraph.slice(4)}</h3>;
                } else if (paragraph.match(/^\d+\./)) {
                  return <div key={index} className="flex items-start gap-2 mb-2"><span className="text-blue-600 dark:text-blue-400 font-medium">{paragraph.split('.')[0]}.</span><span>{paragraph.split('.').slice(1).join('.')}</span></div>;
                } else if (paragraph.startsWith('- ')) {
                  return <li key={index} className="ml-4 mb-1">{paragraph.slice(2)}</li>;
                } else {
                  return paragraph ? <p key={index} className="mb-3 text-slate-700 dark:text-slate-300">{paragraph}</p> : null;
                }
              })}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {selectedArticle.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-md">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {selectedArticle.views.toLocaleString()} views
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {selectedArticle.helpful}% helpful
              </span>
              <div className="flex items-center gap-3 ml-auto">
                <button className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm">
                  <ThumbsUp size={14} />
                  <span>Helpful</span>
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm">
                  <ThumbsDown size={14} />
                  <span>Not Helpful</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-950/50 dark:to-slate-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25">
              <HelpCircle size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Help & Support</h1>
              <p className="text-slate-500 dark:text-slate-400">Find answers, get help, and connect with our support team</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search for articles, FAQs, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Mail size={20} />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">Email Support</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">support@benchastra.com</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <MessageCircle size={20} />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">Live Chat</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Available 24/7</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <Clock size={20} />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">Response Time</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Usually within 2 hours</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === 'articles'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Articles
            {activeTab === 'articles' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === 'faq'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            FAQ
            {activeTab === 'faq' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === 'tickets'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            My Tickets
            {activeTab === 'tickets' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
            )}
          </button>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'articles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                        {article.category}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {article.views.toLocaleString()} views
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>By {article.author.name}</span>
                        <span>•</span>
                        <span>{new Date(article.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium">
                        <span>Read More</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">No articles found matching your search.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-3">
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {faq.question}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                          {faq.category}
                        </span>
                      </div>
                      <ChevronRight
                        size={18}
                        className={`text-slate-400 transition-transform ${
                          expandedFAQ === faq.id ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Search size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">No FAQs found matching your search.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {tickets.filter(t => t.status !== 'closed').length} active tickets
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all">
                  Create New Ticket
                </button>
              </div>

              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {ticket.id}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)} flex items-center gap-1`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {ticket.messages} messages
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {ticket.subject}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                    <span>Last updated: {new Date(ticket.lastUpdated).toLocaleDateString()}</span>
                    <button className="text-blue-600 dark:text-blue-400 hover:underline">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}