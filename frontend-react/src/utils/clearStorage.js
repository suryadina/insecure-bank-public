// Clear corrupted localStorage data
console.log('Clearing potentially corrupted localStorage data...');
localStorage.removeItem('authToken');
localStorage.removeItem('authUser');
console.log('Storage cleared. Please refresh the page.');