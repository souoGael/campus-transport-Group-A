import  { useEffect, useState } from "react";
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from './firebase'; // Adjust the import based on your Firebase setup

export const useUserData = () => {
    const [userData, setUserData] = useState([]);
    const [userId, setUserId] = useState(null);
    const [rentalCancelled, setRentalCancelled] = useState(false);
  
    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          const storedUserData = sessionStorage.getItem('userData');
          const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;
  
          setUserId(user.uid);
  
          if (!parsedUserData || parsedUserData.uid !== user.uid || rentalCancelled) {
            sessionStorage.removeItem('userData');
            // console.log("Fetching from firestore...");
  
            const userRef = doc(firestore, 'Users', user.uid);
            getDoc(userRef).then((docSnap) => {
              if (docSnap.exists()) {
                const fetchedUserData = { ...docSnap.data(), uid: user.uid };
                setUserData(fetchedUserData);
                sessionStorage.setItem('userData', JSON.stringify(fetchedUserData));
                setRentalCancelled(false);
              }
            });
          } else {
            // console.log("Fetching from sessionStorage...");
            setUserData(parsedUserData);
          }
        } else {
          sessionStorage.removeItem('userData');
          setUserId(null);
          setUserData(null);
        }
      });
  
      return () => unsubscribe();
    }, [rentalCancelled]);
  
    const refetchUserData = () => setRentalCancelled(true);
  
    return { userData, userId, refetchUserData };
  };
