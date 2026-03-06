import { useState, useEffect } from 'react';
import { Star, MessageSquare, Trash2, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';
import { auth } from '@/lib/firebase';

interface ReviewData {
    id: string;
    userId: string;
    username: string;
    avatar: string;
    rating: number;
    comment: string;
    createdAt?: number;
    updatedAt?: number;
}

interface ReviewSectionProps {
    dramaId: string | undefined;
}

const ReviewSection = ({ dramaId }: ReviewSectionProps) => {
    const { user, profile } = useAuth();
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [stats, setStats] = useState({ average: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [myRating, setMyRating] = useState(0);
    const [myComment, setMyComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoveredStar, setHoveredStar] = useState(0);

    const fetchReviews = async () => {
        if (!dramaId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/reviews?dramaId=${encodeURIComponent(dramaId)}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data.reviews || []);
                setStats(data.stats || { average: 0, total: 0 });
                // If user is logged in, find if they already reviewed
                if (user) {
                    const myReview = data.reviews.find((r: ReviewData) => r.userId === user.uid);
                    if (myReview) {
                        setMyRating(myReview.rating);
                        setMyComment(myReview.comment);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dramaId, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            Swal.fire({ icon: 'warning', title: 'กรุณาเข้าสู่ระบบ', text: 'เพื่อแสดงความคิดเห็น', background: '#18181b', color: '#fff' });
            return;
        }
        if (myRating < 1 || myRating > 5) {
            Swal.fire({ icon: 'warning', title: 'กรุณาให้คะแนน', background: '#18181b', color: '#fff' });
            return;
        }

        setIsSubmitting(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    dramaId,
                    rating: myRating,
                    comment: myComment
                })
            });

            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'ส่งรีวิวสำเร็จ', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false, background: '#18181b', color: '#fff' });
                fetchReviews();
            } else {
                throw new Error('Failed to submit review');
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถบันทึกรีวิวได้', background: '#18181b', color: '#fff' });
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (reviewUserId: string) => {
        const result = await Swal.fire({
            title: 'ต้องการลบรีวิวใช่หรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            background: '#18181b',
            color: '#fff',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                const token = await auth.currentUser?.getIdToken();
                const res = await fetch('/api/reviews', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        dramaId,
                        targetUserId: reviewUserId
                    })
                });

                if (res.ok) {
                    Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', toast: true, position: 'top-end', timer: 1500, showConfirmButton: false, background: '#18181b', color: '#fff' });
                    if (reviewUserId === user?.uid) {
                        setMyRating(0);
                        setMyComment('');
                    }
                    fetchReviews();
                } else {
                    throw new Error('Failed to delete review');
                }
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถลบรีวิวได้', background: '#18181b', color: '#fff' });
            }
        }
    };

    if (!dramaId) return null;

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 mt-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-xl">
                    <MessageSquare size={20} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white leading-tight">Reviews & Ratings</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex text-yellow-500">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} size={14} className={star <= Math.round(stats.average) ? 'fill-yellow-500' : 'text-zinc-600'} />
                            ))}
                        </div>
                        <span className="text-sm font-bold text-white">{stats.average.toFixed(1)}</span>
                        <span className="text-xs text-zinc-500">({stats.total} reviews)</span>
                    </div>
                </div>
            </div>

            {/* Submit Review Form */}
            {user && (
                <form onSubmit={handleSubmit} className="mb-10 bg-zinc-950/50 rounded-2xl p-5 border border-zinc-800/50">
                    <div className="flex items-center gap-4 mb-4">
                        <img src={profile?.avatar || '/default-avatar.png'} alt="" className="w-10 h-10 rounded-full border-2 border-zinc-800 bg-zinc-800 object-cover" />
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    onMouseLeave={() => setHoveredStar(0)}
                                    onClick={() => setMyRating(star)}
                                    className="p-1 transition-all"
                                >
                                    <Star
                                        size={24}
                                        className={`transition-colors ${(hoveredStar || myRating) >= star ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-700'}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <textarea
                            value={myComment}
                            onChange={(e) => setMyComment(e.target.value)}
                            placeholder="เขียนความคิดเห็นของคุณเกี่ยวกับซีรีส์เรื่องนี้..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 text-sm font-medium resize-none"
                            rows={3}
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || myRating === 0}
                            className="absolute bottom-3 right-3 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 text-xs font-black rounded-lg uppercase tracking-wider transition-colors"
                        >
                            {isSubmitting ? 'Sending...' : 'Post Review'}
                            <Send size={14} />
                        </button>
                    </div>
                </form>
            )}

            {!user && (
                <div className="mb-10 p-6 text-center border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-950/30">
                    <p className="text-zinc-500 text-sm font-medium mb-3">เข้าสู่ระบบเพื่อแสดงความคิดเห็น</p>
                    <button onClick={() => window.location.href = '/login'} className="px-5 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-black rounded-full transition-colors uppercase tracking-widest">
                        เข้าสู่ระบบ
                    </button>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="p-5 bg-zinc-950/30 border border-zinc-800/50 rounded-2xl flex gap-4 transition-all hover:bg-zinc-900/50">
                            <img src={review.avatar || '/default-avatar.png'} alt="" className="w-10 h-10 rounded-full bg-zinc-800 shrink-0 object-cover" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4 mb-1">
                                    <div className="flex items-center gap-2 truncate">
                                        <span className="font-bold text-white text-sm truncate">{review.username}</span>
                                        <span className="text-[10px] text-zinc-600 shrink-0">
                                            {new Date(review.createdAt || review.updatedAt || Date.now()).toLocaleDateString('th-TH')}
                                        </span>
                                    </div>
                                    {(user?.uid === review.userId || profile?.role === 'admin') && (
                                        <button
                                            onClick={() => handleDelete(review.userId)}
                                            className="p-1.5 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                                            title="ลบความคิดเห็น"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-0.5 text-yellow-500 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} size={10} className={star <= review.rating ? 'fill-yellow-500' : 'text-zinc-700'} />
                                    ))}
                                </div>
                                {review.comment && (
                                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap word-break">
                                        {review.comment}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-12 text-zinc-500">
                        <MessageSquare size={40} className="mx-auto mb-4 opacity-20" />
                        <p className="font-medium text-sm">ยังไม่มีรีวิวสำหรับซีรีส์เรื่องนี้</p>
                        <p className="text-xs mt-1">มารีวิวเป็นคนแรกสิ!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
