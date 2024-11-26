export function generateName(
  commonNameSelect: HTMLSelectElement,
  typeSelect: HTMLSelectElement,
  brandSelect: HTMLSelectElement,
  mpnInput: HTMLInputElement,
  skuInput: HTMLInputElement,
  nameInput: HTMLInputElement
): void {
  const commonName = commonNameSelect.options[commonNameSelect.selectedIndex]?.text || '';
  const type = typeSelect.options[typeSelect.selectedIndex]?.text || '';
  const brand = brandSelect.options[brandSelect.selectedIndex]?.text || '';
  const mpn = mpnInput.value.trim();
  const sku = skuInput.value.trim();

  const parts = [commonName, type, brand].filter(part => 
    part && part !== '-- Seleccionar Nombre Común --' && 
    part !== '-- Seleccionar Tipo --' && 
    part !== '-- Seleccionar Marca --'
  );

  // Add MPN or SKU if available
  if (mpn) {
    parts.push(mpn);
  } else if (sku) {
    parts.push(sku);
  }

  // Set the generated name
  nameInput.value = parts.join(' ');
}
