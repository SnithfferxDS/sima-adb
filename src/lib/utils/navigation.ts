export function isCurrentPath(itemPath: string, currentPath: string): boolean {
	// Handle root path
	if (itemPath === '/' && currentPath === '/') {
		return true;
	}

	// Handle other paths
	if (itemPath !== '/') {
		return currentPath.startsWith(itemPath);
	}

	return false;
}
