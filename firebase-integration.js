// FIREBASE INTEGRATION - Nostalgic Find
// Replace the section in index.html <script> section with this code

// ============================================
// 🔥 FIREBASE CONFIGURATION
// ============================================
// Replace this with YOUR Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ============================================
// Initialize Firebase
// ============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getDatabase, ref, onValue, set, remove, push, update } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ============================================
// Variables
// ============================================
const ADMIN_PASSWORD = 'admin123'; // CHANGE THIS!
let items = [];
let selectedFiles = [];
let isAdminLoggedIn = sessionStorage.getItem('nostalgicFindAdminLoggedIn') === 'true';

// ============================================
// Firebase Functions
// ============================================

// Load items from Firebase with real-time listener
function loadItems() {
  return new Promise((resolve) => {
    const itemsRef = ref(database, 'items');
    
    // Real-time listener - triggers whenever data changes
    onValue(itemsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        items = Object.values(data).sort((a, b) => b.createdAt - a.createdAt);
      } else {
        items = [];
      }
      
      // Update UI whenever data changes
      displayItems();
      updateAdminDashboard();
      
      resolve();
    }, (error) => {
      console.error('Error loading items:', error);
      resolve();
    });
  });
}

// Add or update item in Firebase
function saveItem(item) {
  return new Promise((resolve, reject) => {
    const itemRef = ref(database, `items/${item.id}`);
    set(itemRef, item)
      .then(() => {
        console.log('Item saved:', item.id);
        resolve();
      })
      .catch((error) => {
        console.error('Error saving item:', error);
        reject(error);
      });
  });
}

// Delete item from Firebase
function deleteItem(itemId) {
  return new Promise((resolve, reject) => {
    const itemRef = ref(database, `items/${itemId}`);
    remove(itemRef)
      .then(() => {
        console.log('Item deleted:', itemId);
        resolve();
      })
      .catch((error) => {
        console.error('Error deleting item:', error);
        reject(error);
      });
  });
}

// Add to recent sales
function addToRecentSales(item) {
  return new Promise((resolve, reject) => {
    const salesRef = ref(database, 'recentSales');
    const newSaleRef = push(salesRef);
    set(newSaleRef, {
      title: item.title,
      price: item.price,
      soldAt: new Date().toISOString(),
      image: item.images[0] || ''
    })
      .then(() => resolve())
      .catch((error) => reject(error));
  });
}

// ============================================
// Item Management Functions
// ============================================

async function addItem(formData) {
  const newItem = {
    id: Date.now().toString(),
    title: formData.title,
    category: formData.category,
    price: parseFloat(formData.price),
    description: formData.description,
    images: formData.images,
    newArrival: formData.newArrival,
    sold: false,
    createdAt: Date.now()
  };

  try {
    await saveItem(newItem);
    // UI updates automatically via real-time listener
  } catch (error) {
    console.error('Error adding item:', error);
    alert('Error adding item. Please try again.');
  }
}

async function markItemAsSold(itemId) {
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  try {
    await addToRecentSales(item);
    item.sold = true;
    await saveItem(item);
    // UI updates automatically via real-time listener
  } catch (error) {
    console.error('Error marking as sold:', error);
    alert('Error marking item as sold.');
  }
}

async function editItem(itemId, updatedData) {
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  try {
    const updated = { ...item, ...updatedData };
    await saveItem(updated);
    // UI updates automatically via real-time listener
  } catch (error) {
    console.error('Error editing item:', error);
    alert('Error editing item.');
  }
}

async function removeItem(itemId) {
  if (!confirm('Are you sure you want to delete this item?')) return;

  try {
    await deleteItem(itemId);
    // UI updates automatically via real-time listener
  } catch (error) {
    console.error('Error deleting item:', error);
    alert('Error deleting item.');
  }
}

// ============================================
// Display Functions (from your original code)
// ============================================

function displayItems() {
  // Your original displayItems() code here
  // It will automatically update whenever Firebase data changes
}

function updateAdminDashboard() {
  // Your original updateAdminDashboard() code here
  // It will automatically update with new data
}

// ============================================
// Initialize on Page Load
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  await loadItems();
  // Rest of your initialization code
});

// ============================================
// Export Functions for HTML
// ============================================
window.saveItem = saveItem;
window.deleteItem = deleteItem;
window.addItem = addItem;
window.markItemAsSold = markItemAsSold;
window.editItem = editItem;
window.removeItem = removeItem;
