import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  ScrollView,
  Image,
  StyleSheet,
  Modal,
  Pressable,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import COLORS from '../../constants/colors';

export default function HomePage() {
  const [modalVisible, setModalVisible] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [page, setPage] = useState(1);
  const router = useRouter();

  const fetchNews = async (pageNum = 1) => {
    try {
      const response = await fetch(
        `https://gnews.io/api/v4/search?q=(road OR traffic OR transportation OR commute OR highway OR expressway OR MMDA OR LTO OR DOTr)&country=ph&token=c7517e5dc82d03b12d63597965cafc4c&page=${pageNum}&sortby=publishedAt`
      );
      const data = await response.json();
      
      if (data && data.articles && Array.isArray(data.articles)) {
        const transformedNews = data.articles.map(article => ({
          title: article.title,
          description: article.description,
          image_url: article.image,
          pubDate: article.publishedAt,
          source_id: article.source.name,
          link: article.url
        }));

        // Filter out duplicates based on title
        const uniqueNews = transformedNews.filter(newArticle => 
          !news.some(existingArticle => 
            existingArticle.title === newArticle.title
          )
        );
        
        if (pageNum === 1) {
          setNews(uniqueNews);
        } else {
          setNews(prevNews => [...prevNews, ...uniqueNews]);
        }
      } else {
        console.error('Invalid API response format:', data);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setNews([]); // Clear existing news before refreshing
    await fetchNews(1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchNews(1);
  }, []);

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isCloseToBottom && !loadingMore && news.length > 0) {
      loadMoreNews();
    }
  };

  const loadMoreNews = () => {
    if (!loadingMore && news.length > 0) {
      setLoadingMore(true);
      setPage(prevPage => prevPage + 1);
      fetchNews(page + 1);
    }
  };

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image 
          source={require('../../assets/images/LOGO1.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      onScroll={handleScroll}
      scrollEventThrottle={400}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
          title="Pull to refresh"
          titleColor="#666"
        />
      }
    >
      <View style={styles.container}>
        {/* Top Section */}
        <View style={styles.topSection}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome to BiyaHero</Text>
            <Text style={styles.tagline}>Basta Batangueño, Swabe ang Biyahe!</Text>
          </View>
        </View>

        {/* Road Updates Section */}
        <Text style={styles.sectionTitle}>Latest News</Text>

        {loading && page === 1 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading news...</Text>
          </View>
        ) : news.length === 0 ? (
          <Text style={styles.noNewsText}>No news available</Text>
        ) : (
          <>
            {news.map((article, index) => (
              <View key={index} style={styles.card}>
                {article.image_url ? (
                  <Image 
                    source={{ uri: article.image_url }} 
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.cardImage, { backgroundColor: COLORS.light }]} />
                )}
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{article.title}</Text>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTime}>
                      {new Date(article.pubDate).toLocaleTimeString()}
                    </Text>
                    <Text style={styles.cardSource}>
                      {article.source_id || 'Unknown Source'}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.moreInfoButton}
                    onPress={() => {
                      setSelectedArticle(article);
                      setModalVisible(true);
                    }}
                  >
                    <Text style={styles.moreInfoText}>More Info</Text>
                  </Pressable>
                </View>
              </View>
            ))}
            
            {loadingMore ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingMoreText}>Loading more news...</Text>
              </View>
            ) : (
              <Pressable
                style={styles.loadMoreButton}
                onPress={loadMoreNews}
              >
                <Text style={styles.loadMoreText}>Load More News</Text>
              </Pressable>
            )}
          </>
        )}

        {/* Modal for More Info */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>News Details</Text>
              {selectedArticle ? (
                <>
                  <Text style={styles.modalArticleTitle}>
                    {selectedArticle.title}
                  </Text>

                  <ScrollView style={styles.modalScroll} contentContainerStyle={{ paddingBottom: 20 }}>
                    <Text style={styles.modalDescription}>
                      {selectedArticle.description || 'No description provided.'}
                    </Text>
                  </ScrollView>

                  {selectedArticle.link && (
                    <Pressable
                      style={[styles.modalButton, { backgroundColor: COLORS.primary }]}
                      onPress={() => Linking.openURL(selectedArticle.link)}
                    >
                      <Text style={styles.modalButtonText}>Read Full Article</Text>
                    </Pressable>
                  )}

                  <Pressable
                    style={[styles.modalButton, { backgroundColor: COLORS.gray }]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Close</Text>
                  </Pressable>
                </>
              ) : (
                <Text>No article selected</Text>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  scrollContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 20,
    width: '100%',
  },
  titleContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: COLORS.gray,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginVertical: 20,
  },
  card: {
    width: '100%',
    height: 280,
    marginVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: '50%',
  },
  cardContent: {
    padding: 15,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 8,
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTime: {
    fontSize: 12,
    color: COLORS.gray,
  },
  cardSource: {
    fontSize: 12,
    color: COLORS.gray,
  },
  moreInfoButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  moreInfoText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.gray,
  },
  noNewsText: {
    textAlign: 'center',
    color: COLORS.gray,
    marginTop: 20,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 15,
  },
  modalArticleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 200,
    marginVertical: 15,
  },
  modalDescription: {
    fontSize: 14,
    color: COLORS.dark,
    textAlign: 'justify',
    lineHeight: 20,
  },
  modalButton: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingMoreContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    marginTop: 10,
    color: COLORS.gray,
  },
  loadMoreButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
