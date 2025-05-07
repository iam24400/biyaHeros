import queriesDB from "../database/queriesDB.js"


export const viewHistory = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await queriesDB.viewHistory(userId);

    const formattedHistory = result.rows.map(record => ({
      id: record.id,
      name: `${record.startLocation} - ${record.destination}`,
      time: new Date(record.timeStamp).toLocaleTimeString(),
      date: new Date(record.timeStamp).toLocaleDateString(),
      duration: record.estimatedTime,
      price: record.fare,
      favorite: record.isFavorite
    }));

    res.status(200).json(formattedHistory);
  } catch (error) {
    console.error('Error retrieving history:', error);
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
};


export const storeHistory = async (req, res) => {
  try {
    const { userId, destination, startLocation, estimatedTime, fare } = req.body;

    // Validate required fields
    if (!userId || !destination || !startLocation || !estimatedTime || !fare) {
      return res.status(400).json({ 
        error: 'Missing required fields. Please provide userId, destination, startLocation, estimatedTime, and fare' 
      });
    }

    const result = await queriesDB.storeHistory(userId, destination, startLocation, estimatedTime, fare);

    res.status(201).json({ 
      message: 'History record created successfully',
      id: result.rows[0].id
    });

  } catch (error) {
    console.error('Error storing history:', error);
    res.status(500).json({ error: 'Failed to store history record' });
  }
};


export const updateFavorite = async (req, res) => {
  try {
    const { historyId, isFavorite } = req.body;

    // Validate required fields
    if (historyId === undefined || isFavorite === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields. Please provide historyId and isFavorite' 
      });
    }

    const result = await queriesDB.updateFavorite(historyId, isFavorite);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'History record not found' });
    }

    res.status(200).json({ 
      message: 'Favorite status updated successfully',
      id: result.rows[0].id,
      isFavorite: result.rows[0].isFavorite
    });

  } catch (error) {
    console.error('Error updating favorite status:', error);
    res.status(500).json({ error: 'Failed to update favorite status' });
  }
};
