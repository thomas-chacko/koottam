import { PostDetailView } from '@/components/features/Feed/PostDetailView';
export default function PostPage({ params }: { params: { id: string } }) {
  return <PostDetailView postId={params.id} />;
}
