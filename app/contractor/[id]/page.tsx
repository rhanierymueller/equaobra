import { ContractorClient } from './ContractorClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ContractorPage({ params }: Props) {
  const { id } = await params
  return <ContractorClient id={id} />
}
