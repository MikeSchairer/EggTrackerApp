import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandling';
import { FlockState } from '../types/flock';
import { loadFlockState, saveFlockState } from '../utils/storage';

export async function fetchUserFlockData(userId: string): Promise<FlockState | null> {
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return loadFlockState();
  }
  const docPath = `users/${userId}/flockData/current`;
  try {
    const docRef = doc(db, 'users', userId, 'flockData', 'current');
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      if (data.flockDataJson) {
        try {
          const parsed = JSON.parse(data.flockDataJson);
          return parsed as FlockState;
        } catch (e) {
          console.error('Error parsing flockDataJson:', e);
        }
      }
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

export async function saveUserFlockData(userId: string, state: FlockState): Promise<void> {
  // Always update local cache
  saveFlockState(state);

  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return;
  }
  const docPath = `users/${userId}/flockData/current`;
  try {
    const docRef = doc(db, 'users', userId, 'flockData', 'current');
    const jsonStr = JSON.stringify(state);

    await setDoc(docRef, {
      userId,
      flockDataJson: jsonStr,
      updatedAt: new Date().toISOString(),
    });

    // Also update local cache
    saveFlockState(state);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export function subscribeToUserFlockData(
  userId: string,
  onData: (state: FlockState) => void,
  onError?: (error: unknown) => void
) {
  const docPath = `users/${userId}/flockData/current`;
  const docRef = doc(db, 'users', userId, 'flockData', 'current');

  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.flockDataJson) {
          try {
            const parsed = JSON.parse(data.flockDataJson);
            onData(parsed);
          } catch (e) {
            console.error('Snapshot JSON parse error:', e);
          }
        }
      }
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, docPath);
    }
  );
}
