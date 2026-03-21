import { ProfileClient } from './ProfileClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProfessionalPage({ params }: Props) {
  const { id } = await params
  return <ProfileClient id={id} />
}
