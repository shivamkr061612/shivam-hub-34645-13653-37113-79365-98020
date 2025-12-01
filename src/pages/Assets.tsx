import { useState, useEffect } from 'react';
import { Header } from '@/components/Layout/Header';
import { ContentList } from '@/components/Content/ContentList';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const Assets = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'assets'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(data);
      } catch (error) {
        console.error('Error fetching assets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ContentList 
        title="Assets" 
        items={items} 
        loading={loading}
        type="assets"
      />
    </div>
  );
};

export default Assets;
