// src/lib/db.js
import { connectToDatabase } from './mongodb';

// Initialize database connection
export async function initializeDatabase() {
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Allow the application to continue even if initial connection fails
    // It will retry on subsequent API calls
  }
}

// Initialize connection when importing this file
initializeDatabase();

// For use in React Server Components if needed
export async function getServerSideProps() {
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Failed to connect to database in getServerSideProps:', error);
  }
  return { props: {} };
}