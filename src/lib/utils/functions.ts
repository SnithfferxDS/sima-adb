import { BASE_URL } from "../../configs/constants";

export function generateName(
  commonNameSelect: HTMLSelectElement,
  typeSelect: HTMLSelectElement,
  brandSelect: HTMLSelectElement,
  mpnInput: HTMLInputElement,
  skuInput: HTMLInputElement,
  nameInput: HTMLInputElement
): void {
  const commonName = commonNameSelect.options[commonNameSelect.selectedIndex]?.text || '';
  const type = typeSelect.value !== "0" ? typeSelect.options[typeSelect.selectedIndex]?.text || '' : '';
  const brand = brandSelect.value !== "0" ? brandSelect.options[brandSelect.selectedIndex]?.text || '' : '';
  const mpn = mpnInput.value.trim();
  const sku = skuInput.value.trim();

  const parts = [commonName, type, brand].filter(part => 
    part && part !== '-- Seleccionar Nombre Común --' && 
    part !== '' && part !== '-- Seleccionar Tipo --' && 
    part !== '-- Seleccionar Marca --' &&
    part !== ''
  );

  // Add MPN or SKU if available
  if (sku && sku !== '') {
    parts.push(sku);
  }
  if (mpn && sku !== '') {
    parts.push(mpn);
  }

  // Set the generated name
  nameInput.value = parts.join(' ');
}

export function url(path = '') {
	return `${BASE_URL}${path}`;
}

export function asset(path: string) {
	return `${BASE_URL}/assets/${path}`;
}