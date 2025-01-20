export interface MetadataGroup {
  id: number;
  name: string;
  metadata: Array<{
    id: number;
    name: string;
    tooltip?: string;
    format?: string;
  }>;
}

export async function fetchMetadataDescription(
  commonNameId: string,
  categoryId: string,
  productTypeId: string
): Promise<MetadataGroup[]> {
  const response = await fetch(
    `/api/metadata/description?commonNameId=${commonNameId}&categoryId=${categoryId}&productTypeId=${productTypeId}`
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export function collectMetadataValues(groups: MetadataGroup[]): Array<{ id: number; value: string }> {
  return groups
    .flatMap(group =>
      group.metadata.map(meta => ({
        id: meta.id,
        value: (document.getElementById(`metadata_${meta.id}`) as HTMLInputElement)?.value || ''
      }))
    )
    .filter(mv => mv.value.trim() !== '');
}