import { TeamDetail } from '@/src/features/team/pages/TeamDetail/TeamDetail'

interface Props {
  params: Promise<{ id: string }>
}

export default async function TeamPage({ params }: Props) {
  const { id } = await params
  return <TeamDetail id={id} />
}
