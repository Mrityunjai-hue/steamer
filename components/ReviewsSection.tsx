"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Star,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  X,
  MessageSquare,
  ThumbsUp,
  Sparkles,
  Camera,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

interface Review {
  id: string;
  userName: string;
  rating: number;
  title?: string | null;
  comment: string;
  gameTitle?: string | null;
  imageUrl?: string | null;
  isVerified: boolean;
  createdAt: string;
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(5.0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PROOF" | "5STAR">("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Form State
  const [userName, setUserName] = useState("");
  const [gameTitle, setGameTitle] = useState("All-Access 265+ Vault");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchReviews = () => {
    fetch("/api/reviews?limit=30")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.reviews) {
          setReviews(data.reviews);
          if (data.averageRating) setAverageRating(data.averageRating);
          if (data.totalCount) setTotalCount(data.totalCount);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("Please select an image smaller than 4 MB.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("userName", userName.trim());
      formData.append("rating", String(rating));
      formData.append("title", title.trim());
      formData.append("comment", comment.trim());
      formData.append("gameTitle", gameTitle.trim());
      if (selectedFile) {
        formData.append("screenshot", selectedFile);
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setFormSuccess(true);
      fetchReviews();
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(false);
        setUserName("");
        setTitle("");
        setComment("");
        handleRemoveImage();
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter === "PROOF") return Boolean(r.imageUrl);
    if (filter === "5STAR") return r.rating === 5;
    return true;
  });

  return (
    <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header with Rating Summary */}
      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Community Trust & Verified Proof
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            GAMER REVIEWS & SETUP SCREENSHOTS
          </h2>
          <p className="text-xs sm:text-sm text-[#8f98a0] max-w-xl leading-relaxed">
            Real feedback from gamers who activated their single-player titles directly on their Steam accounts.
          </p>
        </div>

        {/* Rating Score Pill & Write Button */}
        <div className="flex flex-wrap items-center gap-4">
          {totalCount > 0 && (
            <div className="bg-[#16202d] border border-[#2a475e] p-4 rounded-xl flex items-center gap-3.5 shadow-inner">
              <div className="text-3xl font-black text-amber-400">{averageRating}</div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[11px] text-[#8f98a0]">
                  Based on <strong className="text-white">{totalCount}</strong> verified reviews
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-steam-cta text-xs sm:text-sm px-5 py-3.5 rounded-lg font-bold flex items-center gap-2 shadow-ctaGlow"
          >
            <Camera className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2a475e]/60 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              filter === "ALL"
                ? "bg-[#2a475e] text-white"
                : "bg-[#16202d] text-[#8f98a0] hover:text-white"
            }`}
          >
            All Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setFilter("PROOF")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === "PROOF"
                ? "bg-[#2a475e] text-white"
                : "bg-[#16202d] text-[#8f98a0] hover:text-white"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#66c0f4]" />
            <span>With Proof Photos</span>
          </button>
          <button
            onClick={() => setFilter("5STAR")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
              filter === "5STAR"
                ? "bg-[#2a475e] text-white"
                : "bg-[#16202d] text-[#8f98a0] hover:text-white"
            }`}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>5 Stars</span>
          </button>
        </div>

        <span className="text-[11px] text-[#8f98a0] flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>All reviews verified by Steamer Team</span>
        </span>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#8f98a0]">
          Loading verified reviews...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-[#171a21] border border-[#2a475e] p-12 text-center rounded-xl space-y-3">
          <p className="text-white font-bold">
            {reviews.length === 0 ? "No reviews yet." : "No reviews found in this filter."}
          </p>
          <p className="text-xs text-[#8f98a0] max-w-sm mx-auto">
            {reviews.length === 0
              ? "Be the first customer to share your setup review or gameplay screenshot!"
              : "Try switching back to all reviews."}
          </p>
          <button
            onClick={() => (reviews.length === 0 ? setIsModalOpen(true) : setFilter("ALL"))}
            className="btn-steam-cta text-xs px-4 py-2 rounded inline-flex items-center gap-1.5 font-bold"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{reviews.length === 0 ? "Write the First Review" : "View All Reviews"}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReviews.map((r) => (
            <div
              key={r.id}
              className="bg-[#171a21] border border-[#2a475e]/70 hover:border-[#66c0f4]/50 rounded-xl p-5 space-y-4 shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Rating & Verified Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= r.rating ? "fill-amber-400 text-amber-400" : "text-[#2a475e]"
                        }`}
                      />
                    ))}
                  </div>

                  {r.isVerified && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified Steam Buyer
                    </span>
                  )}
                </div>

                {/* Game Title Tag */}
                {r.gameTitle && (
                  <span className="inline-block text-[11px] font-semibold text-[#66c0f4] bg-[#66c0f4]/10 border border-[#66c0f4]/20 px-2 py-0.5 rounded">
                    {r.gameTitle}
                  </span>
                )}

                {/* Title & Comment */}
                {r.title && (
                  <h4 className="text-sm font-bold text-white line-clamp-1">{r.title}</h4>
                )}
                <p className="text-xs text-[#c7d5e0] leading-relaxed break-words whitespace-pre-wrap">
                  "{r.comment}"
                </p>

                {/* Proof Image / Screenshot (Click to enlarge) */}
                {r.imageUrl && (
                  <div
                    onClick={() => setLightboxImage(r.imageUrl!)}
                    className="relative group cursor-pointer overflow-hidden rounded-lg border border-[#2a475e] bg-black/40 h-44 flex items-center justify-center"
                  >
                    <img
                      src={r.imageUrl}
                      alt="Verified Setup Proof"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs font-bold text-white">
                      <Camera className="w-4 h-4 text-[#66c0f4]" />
                      <span>Click to view proof</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Author & Date Footer */}
              <div className="pt-3 border-t border-[#2a475e]/40 flex items-center justify-between text-[11px] text-[#8f98a0]">
                <span className="font-semibold text-white">{r.userName}</span>
                <span>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal for Proof Images */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-[#171a21] border border-[#2a475e] rounded-xl p-2 shadow-2xl overflow-hidden">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage}
              alt="Full Resolution Proof"
              className="max-h-[85vh] w-auto mx-auto rounded-lg object-contain"
            />
          </div>
        </div>
      )}

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171a21] border border-[#2a475e] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  Write a Verified Gamer Review
                </h3>
                <p className="text-[11px] text-[#8f98a0]">
                  Share your experience with the setup guide and offline play.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8f98a0] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-950/60 border border-red-500/50 p-3 rounded text-xs text-red-200">
                {formError}
              </div>
            )}

            {formSuccess ? (
              <div className="bg-emerald-950/70 border border-emerald-500/60 p-6 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Review Submitted!</h4>
                <p className="text-xs text-emerald-200">
                  Thank you for contributing to the Steamer community trust network.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Rating Stars Picker */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white block">Your Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-[#2a475e] hover:text-amber-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-400 ml-2">
                      {rating} out of 5 Stars
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white block">Name or Gamer Tag</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Rahul S. / ApexGamer"
                    required
                    className="w-full bg-[#16202d] border border-[#2a475e] rounded px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-[#66c0f4]"
                  />
                </div>

                {/* Game Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white block">Game Configured</label>
                  <input
                    type="text"
                    value={gameTitle}
                    onChange={(e) => setGameTitle(e.target.value)}
                    placeholder="e.g. Call of Duty, GTA V, Black Myth Wukong, or Full Vault"
                    className="w-full bg-[#16202d] border border-[#2a475e] rounded px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-[#66c0f4]"
                  />
                </div>

                {/* Headline / Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white block">Headline (Optional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Working 100% on my Steam account without issues!"
                    className="w-full bg-[#16202d] border border-[#2a475e] rounded px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-[#66c0f4]"
                  />
                </div>

                {/* Comment */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white block">Review Details</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="How was your experience with the setup walkthrough, offline play, and support?"
                    required
                    className="w-full bg-[#16202d] border border-[#2a475e] rounded px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-[#66c0f4]"
                  />
                </div>

                {/* Screenshot Upload with live preview */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white block">
                    Upload Setup Screenshot / Photo Proof (Optional)
                  </label>
                  <div className="border border-dashed border-[#2a475e] hover:border-[#66c0f4]/60 rounded-xl p-4 bg-[#16202d]/60 text-center transition-colors">
                    {previewImage ? (
                      <div className="relative inline-block">
                        <img
                          src={previewImage}
                          alt="Upload Preview"
                          className="h-32 w-auto max-w-full rounded-lg object-contain border border-[#2a475e]"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer space-y-2 py-2"
                      >
                        <Upload className="w-6 h-6 text-[#66c0f4] mx-auto opacity-80" />
                        <div className="text-xs text-[#c7d5e0]">
                          <span className="font-bold text-[#66c0f4]">Click to upload</span> gameplay screenshot or setup proof
                        </div>
                        <p className="text-[10px] text-[#8f98a0]">
                          PNG, JPG, or WEBP up to 4 MB
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2a475e]/60">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-[#16202d] border border-[#2a475e] text-white text-xs font-bold rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-steam-cta px-6 py-2 text-xs font-bold rounded shadow-ctaGlow disabled:opacity-40"
                  >
                    {submitting ? "Publishing..." : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

