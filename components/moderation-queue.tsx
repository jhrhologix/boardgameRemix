'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface ModerationQueueItem {
  id: string;
  content_type: 'remix' | 'comment' | 'edit';
  content_id: string;
  user_id: string;
  content_data: any;
  ai_analysis?: {
    contentScore: number;
    decision: string;
    spamRisk: string;
    qualityScore: number;
    aiDetected: boolean;
    anthropicFlag: boolean;
    reasoning: string[];
    recommendedAction: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  moderator_id?: string;
  moderator_notes?: string;
  created_at: string;
  updated_at: string;
}

interface ModerationStats {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  escalatedCount: number;
  totalFlags: number;
}

export function ModerationQueue() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<ModerationQueueItem[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ModerationQueueItem | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkUserRole();
    }
  }, [user]);

  useEffect(() => {
    if (userRole && (userRole === 'admin' || userRole === 'moderator')) {
      fetchQueueItems();
      fetchStats();
    }
  }, [userRole]);

  const checkUserRole = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/user-role');
      const data = await response.json();
      setUserRole(data.role);
      
      if (data.role !== 'admin' && data.role !== 'moderator') {
        router.push('/');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      router.push('/');
    }
  };

  const fetchQueueItems = async () => {
    try {
      const response = await fetch('/api/moderation-queue');
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching queue items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/moderation-queue?stats=true');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleModerationAction = async (itemId: string, status: 'approved' | 'rejected' | 'escalated') => {
    setActionLoading(itemId);
    try {
      const response = await fetch('/api/moderation-queue', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queueId: itemId,
          status,
          notes: moderatorNotes
        }),
      });

      if (response.ok) {
        await fetchQueueItems();
        await fetchStats();
        setSelectedItem(null);
        setModeratorNotes('');
      } else {
        console.error('Failed to update moderation status');
      }
    } catch (error) {
      console.error('Error updating moderation status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'escalated':
        return <Badge variant="destructive" className="bg-orange-600">Escalated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getContentTypeBadge = (type: string) => {
    switch (type) {
      case 'remix':
        return <Badge variant="secondary">Remix</Badge>;
      case 'comment':
        return <Badge variant="outline">Comment</Badge>;
      case 'edit':
        return <Badge variant="outline">Edit</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (loading || !userRole) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (userRole !== 'admin' && userRole !== 'moderator') {
    return (
      <div className="flex items-center justify-center p-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access the moderation queue.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approvedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejectedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Escalated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.escalatedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFlags}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Queue Items */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Moderation Queue</h2>
        {items.length === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No pending items in the moderation queue.
            </AlertDescription>
          </Alert>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getContentTypeBadge(item.content_type)}
                    {getStatusBadge(item.status)}
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedItem(item)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {item.content_data.title && (
                    <div>
                      <strong>Title:</strong> {item.content_data.title}
                    </div>
                  )}
                  {item.content_data.description && (
                    <div>
                      <strong>Description:</strong> {item.content_data.description.substring(0, 200)}...
                    </div>
                  )}
                  {item.ai_analysis && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>Score: {item.ai_analysis.contentScore}/100</div>
                      <div>Quality: {item.ai_analysis.qualityScore}/10</div>
                      <div>Spam Risk: {item.ai_analysis.spamRisk}</div>
                      <div>AI Detected: {item.ai_analysis.aiDetected ? 'Yes' : 'No'}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Review Content</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setSelectedItem(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Content Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Content Details</h3>
                {selectedItem.content_data.title && (
                  <div>
                    <strong>Title:</strong>
                    <p className="mt-1">{selectedItem.content_data.title}</p>
                  </div>
                )}
                {selectedItem.content_data.description && (
                  <div>
                    <strong>Description:</strong>
                    <p className="mt-1 whitespace-pre-wrap">{selectedItem.content_data.description}</p>
                  </div>
                )}
                {selectedItem.content_data.rules && (
                  <div>
                    <strong>Rules:</strong>
                    <p className="mt-1 whitespace-pre-wrap">{selectedItem.content_data.rules}</p>
                  </div>
                )}
                {selectedItem.content_data.comment && (
                  <div>
                    <strong>Comment:</strong>
                    <p className="mt-1 whitespace-pre-wrap">{selectedItem.content_data.comment}</p>
                  </div>
                )}
              </div>

              {/* AI Analysis */}
              {selectedItem.ai_analysis && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">AI Analysis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedItem.ai_analysis.contentScore}</div>
                      <div className="text-sm text-muted-foreground">Content Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedItem.ai_analysis.qualityScore}</div>
                      <div className="text-sm text-muted-foreground">Quality Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedItem.ai_analysis.spamRisk}</div>
                      <div className="text-sm text-muted-foreground">Spam Risk</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedItem.ai_analysis.aiDetected ? 'Yes' : 'No'}</div>
                      <div className="text-sm text-muted-foreground">AI Detected</div>
                    </div>
                  </div>
                  <div>
                    <strong>Reasoning:</strong>
                    <ul className="mt-1 list-disc list-inside">
                      {selectedItem.ai_analysis.reasoning.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Recommended Action:</strong>
                    <p className="mt-1">{selectedItem.ai_analysis.recommendedAction}</p>
                  </div>
                </div>
              )}

              {/* Moderator Notes */}
              <div className="space-y-2">
                <label htmlFor="moderator-notes" className="text-sm font-medium">
                  Moderator Notes
                </label>
                <Textarea
                  id="moderator-notes"
                  placeholder="Add notes about your decision..."
                  value={moderatorNotes}
                  onChange={(e) => setModeratorNotes(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleModerationAction(selectedItem.id, 'approved')}
                  disabled={actionLoading === selectedItem.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {actionLoading === selectedItem.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>
                <Button
                  onClick={() => handleModerationAction(selectedItem.id, 'rejected')}
                  disabled={actionLoading === selectedItem.id}
                  variant="destructive"
                >
                  {actionLoading === selectedItem.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Reject
                </Button>
                <Button
                  onClick={() => handleModerationAction(selectedItem.id, 'escalated')}
                  disabled={actionLoading === selectedItem.id}
                  variant="outline"
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                >
                  {actionLoading === selectedItem.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  )}
                  Escalate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
