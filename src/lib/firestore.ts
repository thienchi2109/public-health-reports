'use server';

import { db } from './firebase';
import { doc, setDoc, getDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import type { ReportData } from '@/types/report-data';

const COLLECTION_NAME = 'reports';

/**
 * Save report data to Firestore
 * @param month The month key (e.g., "Tháng 1")
 * @param data The report data to save
 */
export async function saveReportToFirestore(month: string, data: ReportData): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, month);
    await setDoc(docRef, data);
    console.log('Report saved to Firestore:', month);
  } catch (error) {
    console.error('Error saving report to Firestore:', error);
    throw new Error('Failed to save report to Firestore');
  }
}

/**
 * Load a specific report from Firestore
 * @param month The month key to load
 * @returns The report data or null if not found
 */
export async function loadReportFromFirestore(month: string): Promise<ReportData | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, month);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as ReportData;
    } else {
      console.log('No report found for month:', month);
      return null;
    }
  } catch (error) {
    console.error('Error loading report from Firestore:', error);
    throw new Error('Failed to load report from Firestore');
  }
}

/**
 * Load all reports from Firestore
 * @returns Record of all reports keyed by month
 */
export async function loadAllReportsFromFirestore(): Promise<Record<string, ReportData>> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const reports: Record<string, ReportData> = {};
    
    querySnapshot.forEach((doc) => {
      reports[doc.id] = doc.data() as ReportData;
    });
    
    console.log('Loaded reports from Firestore:', Object.keys(reports));
    return reports;
  } catch (error) {
    console.error('Error loading all reports from Firestore:', error);
    throw new Error('Failed to load reports from Firestore');
  }
}

/**
 * Delete a report from Firestore
 * @param month The month key to delete
 */
export async function deleteReportFromFirestore(month: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, month);
    await deleteDoc(docRef);
    console.log('Report deleted from Firestore:', month);
  } catch (error) {
    console.error('Error deleting report from Firestore:', error);
    throw new Error('Failed to delete report from Firestore');
  }
} 