import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, Eye, Calendar, User, Pencil, Tag,
  MessageSquare, Share2, Printer,
  ChevronRight, Clock, BookOpen, Trash2, Copy, ExternalLink
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';

// Sample article data — in production this would come from an API
const articlesData: Record<string, {
  id: number;
  title: string;
  category: string;
  views: number;
  author: string;
  authorInitials: string;
  authorColor: string;
  createdDate: string;
  updatedDate: string;
  status: string;
  readTime: string;
  content: React.ReactNode;
}> = {
  '1': {
    id: 1,
    title: 'EPSS Backup Clone issue',
    category: 'No Category',
    views: 2,
    author: 'abreham tayu',
    authorInitials: 'AT',
    authorColor: '#7c3aed',
    createdDate: 'October 6, 2025',
    updatedDate: 'March 19, 2026',
    status: 'Published',
    readTime: '4 min read',
    content: null,
  },
  '2': {
    id: 2,
    title: 'ERA DC AC power conditioning and failover',
    category: 'Power & UPS',
    views: 7,
    author: 'Wongel Wondyifraw',
    authorInitials: 'WW',
    authorColor: '#1d4ed8',
    createdDate: 'November 5, 2025',
    updatedDate: 'March 19, 2026',
    status: 'Published',
    readTime: '3 min read',
    content: null,
  },
};

// Default article content for any ID
const DefaultArticleContent = () => (
  <div className="prose max-w-none" style={{ fontFamily: "'Inter', sans-serif" }}>
    {/* IE Networks Logo area */}
    <div className="mb-6 pb-6 border-b border-[#f1f3f5]">
      <div className="w-20 h-20 bg-[#0b2235] rounded-lg flex items-center justify-center mb-4">
        <span className="text-[#00c8e8] text-[28px] font-black tracking-tight" style={{ fontFamily: 'Arial Black, sans-serif' }}>IE</span>
      </div>
      <div className="text-[11px] text-[#9ca3af] uppercase tracking-widest font-semibold">IE NETWORKS</div>
    </div>

    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0b2235', marginBottom: '6px' }}>
      AAR for EPSS Backup clone issue
    </h3>
    <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1a1d21', marginBottom: '12px' }}>
      Incident date and members of the team involved
    </h4>

    <div className="space-y-1 mb-5 text-[13px]">
      <div><span className="text-[#6c757d]">Customer Name:</span> <span className="text-[#1a1d21]">EPSS</span></div>
      <div><span className="text-[#6c757d]">Date of Incidence:</span> <span className="text-[#1a1d21]">August 28, 2025</span></div>
      <div className="text-[#1a1d21]">Technical Team involved in identifying & resolving the issue:</div>
      <div className="pl-4 space-y-0.5">
        <div className="flex items-center gap-2 text-[13px]">
          <span className="text-[#2563eb] font-medium">1. Fasika</span>
        </div>
        <div className="flex items-center gap-2 text-[13px]">
          <span className="text-[#2563eb] font-medium">2. Getachew Babulo</span>
        </div>
      </div>
    </div>

    <div className="mb-5">
      <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0b2235', marginBottom: '8px' }}>
        Description of the Issues
      </h4>
      <div className="space-y-1 text-[13px]">
        <div><span className="text-[#6c757d]">Device:</span> <span className="text-[#1a1d21]">Dell Networker Backup Server</span></div>
        <div className="text-[#1a1d21]">
          Issue description: <span className="text-[#2563eb]">The issue was that the clone policy failed to run and was unable to back up data to the tape drive.</span>
        </div>
      </div>
    </div>

    <div className="mb-5">
      <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0b2235', marginBottom: '8px' }}>
        Reasons and work around
      </h4>
      <p className="text-[13px] text-[#4b5563] mb-3">The followings are reasons and work around for the issue</p>

      <div className="bg-[#f8f9fa] border border-[#e1e4e8] rounded-md p-4 mb-4">
        <div className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">ISSUE Description</div>
        <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#0b2235', marginBottom: '8px' }}>What happened?</h5>
        <ul className="space-y-1.5 text-[13px]">
          <li className="flex items-start gap-2">
            <span className="text-[#2563eb] mt-0.5">•</span>
            <span className="text-[#2563eb]">The Dell Networker backup server fail to run backup clone policy and unable backup data to ML3 tape drive for archival.</span>
          </li>
        </ul>

        <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#0b2235', margin: '12px 0 8px' }}>Why did it happen?</h5>
        <ul className="space-y-1.5 text-[13px]">
          <li className="flex items-start gap-2">
            <span className="text-[#6c757d] mt-0.5">•</span>
            <span className="text-[#4b5563]">The tape drive library had a stale session that blocked new clone jobs from initializing.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#6c757d] mt-0.5">•</span>
            <span className="text-[#4b5563]">Networker daemon services were not properly recycled after the previous backup window.</span>
          </li>
        </ul>
      </div>

      <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-md p-4">
        <div className="text-[11px] font-semibold text-[#059669] uppercase tracking-wider mb-2">RESOLUTION</div>
        <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#065f46', marginBottom: '8px' }}>Steps taken to resolve:</h5>
        <ol className="space-y-1.5 text-[13px] list-decimal pl-4">
          <li className="text-[#4b5563]">Connected to the Networker server via SSH and reviewed active sessions.</li>
          <li className="text-[#4b5563]">Killed stale tape library sessions using <code className="bg-[#e6f9f0] px-1 rounded text-[12px] text-[#059669]">nsrjb -H</code> command.</li>
          <li className="text-[#4b5563]">Restarted the Networker services: <code className="bg-[#e6f9f0] px-1 rounded text-[12px] text-[#059669]">systemctl restart networker</code></li>
          <li className="text-[#4b5563]">Manually triggered the clone policy and confirmed successful tape backup completion.</li>
          <li className="text-[#4b5563]">Verified data integrity on ML3 tape drive and closed the incident.</li>
        </ol>
      </div>
    </div>

    <div className="mb-5">
      <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0b2235', marginBottom: '8px' }}>
        Preventive Measures
      </h4>
      <ul className="space-y-1.5 text-[13px]">
        {[
          'Schedule automated session cleanup before each clone policy window.',
          'Add monitoring alerts for failed tape library sessions.',
          'Document and share the resolution steps with the L1 support team.',
          'Review Networker service health checks as part of weekly maintenance.',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-[#0b2235] text-white flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5">{i + 1}</div>
            <span className="text-[#4b5563]">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export function ArticleDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [showMore, setShowMore] = useState(false);

  const article = id ? articlesData[id] : null;

  // Use article data if found, or fallback to article ID 1 data shape
  const data = article ?? {
    id: parseInt(id || '1'),
    title: 'EPSS Backup Clone issue',
    category: 'No Category',
    views: 2,
    author: 'abreham tayu',
    authorInitials: 'AT',
    authorColor: '#7c3aed',
    createdDate: 'October 6, 2025',
    updatedDate: 'March 19, 2026',
    status: 'Published',
    readTime: '4 min read',
    content: null,
  };

  return (
    <div className="min-h-full bg-muted/30 flex flex-col">

      {/* Breadcrumb / Top Nav */}
      <div className="bg-background border-b px-6 h-[44px] flex items-center gap-2 flex-shrink-0">
        <Button
          onClick={() => navigate('/knowledge')}
          variant="ghost"
          size="sm"
          className="h-auto gap-1.5 p-0 text-[12px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Knowledge Base
        </Button>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[12px] text-muted-foreground truncate max-w-xs">{data.title}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Hero Header */}
      <div className="bg-primary px-6 py-7">
          <div className="max-w-4xl mx-auto">
            {/* Meta row */}
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/10 text-white/80 border border-white/10">
                {data.category}
              </span>
              <div className="flex items-center gap-1 text-white/50 text-[12px]">
                <Eye className="w-3.5 h-3.5" />
                {data.views} views
              </div>
              <div className="flex items-center gap-1 text-white/50 text-[12px]">
                <Clock className="w-3.5 h-3.5" />
                {data.readTime}
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${data.status === 'Published' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-white/60'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${data.status === 'Published' ? 'bg-emerald-400' : 'bg-white/30'}`} />
                {data.status}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-[28px] font-semibold text-white leading-tight mb-5 max-w-3xl">
              {data.title}
            </h1>

            {/* Author row */}
            <div className="flex items-center gap-5 text-[12px] text-white/50">
              <div className="flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarFallback className="text-[10px] font-semibold text-white" style={{ backgroundColor: data.authorColor }}>
                    {data.authorInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white/70">{data.author}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {data.createdDate}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Updated {data.updatedDate}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="mx-auto w-full max-w-7xl px-6 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Main Content */}
            <div className="col-span-8">
              <Card className="overflow-hidden p-0">
                {/* Content Header */}
                <CardHeader className="px-5 py-3.5 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[13px] font-semibold">
                    <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                    Content
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2.5 text-[12px]">
                      <Share2 className="w-3.5 h-3.5" />
                      Share
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2.5 text-[12px]">
                      <Printer className="w-3.5 h-3.5" />
                      Print
                    </Button>
                    <Button
                      onClick={() => navigate(`/knowledge/edit/${data.id}`)}
                      size="sm"
                      className="h-7 gap-1.5 px-3 text-[12px]"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit article
                    </Button>
                  </div>
                </CardHeader>

                {/* Rendered content */}
                <CardContent className="p-6">
                  <DefaultArticleContent />
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="col-span-4 space-y-4">
              {/* Article Meta */}
              <Card className="p-4">
                <CardHeader className="p-0 pb-3">
                  <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Article Info</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] text-muted-foreground mb-0.5">Author</div>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-5">
                        <AvatarFallback className="text-[9px] font-semibold text-white" style={{ backgroundColor: data.authorColor }}>
                          {data.authorInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[12px] font-medium">{data.author}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground mb-0.5">Category</div>
                    <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground">
                      <Tag className="w-3 h-3" />
                      {data.category}
                    </span>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground mb-0.5">Created</div>
                    <div className="text-[12px] text-muted-foreground">{data.createdDate}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground mb-0.5">Last Updated</div>
                    <div className="text-[12px] text-muted-foreground">{data.updatedDate}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground mb-0.5">Views</div>
                    <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      {data.views} total views
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground mb-0.5">Status</div>
                    <div className={`flex items-center gap-1.5 text-[12px] font-medium ${data.status === 'Published' ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${data.status === 'Published' ? 'bg-emerald-600' : 'bg-muted-foreground'}`} />
                      {data.status}
                    </div>
                  </div>
                </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="p-4">
                <CardHeader className="p-0 pb-3">
                  <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start gap-2.5 px-3 py-2 text-[13px]">
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    Edit Article
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2.5 px-3 py-2 text-[13px]">
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    Duplicate
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2.5 px-3 py-2 text-[13px]">
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    Share Link
                  </Button>
                  <Separator className="my-1" />
                  <Button variant="ghost" className="w-full justify-start gap-2.5 px-3 py-2 text-[13px] text-red-700 hover:text-red-800">
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Article
                  </Button>
                </div>
                </CardContent>
              </Card>

              {/* Related Articles */}
              <Card className="p-4">
                <CardHeader className="p-0 pb-3">
                  <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Related Articles</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                <div className="space-y-2.5">
                  {[
                    { id: 5, title: 'EPSS Data Domain — lost volume recovery', date: 'Oct 6, 2025' },
                    { id: 7, title: 'ESLSE Active Directory configuration', date: 'Oct 5, 2025' },
                  ].map(rel => (
                    <Button
                      key={rel.id}
                      onClick={() => navigate(`/knowledge/${rel.id}`)}
                      variant="ghost"
                      className="h-auto w-full justify-start p-0 text-left"
                    >
                      <div>
                        <div className="text-[12px] leading-snug font-medium hover:text-primary transition-colors">{rel.title}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{rel.date}</div>
                      </div>
                    </Button>
                  ))}
                </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
