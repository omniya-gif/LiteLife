import { Exercise, ExerciseFilters } from '../types/exercise';

const RAPID_API_KEY = process.env.EXPO_PUBLIC_EXERCISEDB_API_KEY;
const RAPID_API_HOST = process.env.EXPO_PUBLIC_EXERCISEDB_API_HOST;
const BASE_URL = 'https://exercisedb.p.rapidapi.com';

// Validate API keys on module load
if (!RAPID_API_KEY || RAPID_API_KEY === 'undefined') {
  console.error(' EXPO_PUBLIC_EXERCISEDB_API_KEY is not set in .env file!');
}

/**
 * Helper function to make API requests with proper headers
 */
const apiFetch = async (endpoint: string): Promise<any> => {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPID_API_KEY || '',
        'x-rapidapi-host': RAPID_API_HOST || '',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Get a single exercise by ID
 */
export const getExerciseById = async (id: string): Promise<Exercise | null> => {
  try {
    console.log('🏋️ Fetching exercise by ID:', id);
    const data = await apiFetch(`/exercises/exercise/${id}`);
    console.log('✅ Exercise fetched successfully:', data.name);

    // ExerciseDB Image Service requires query parameters: ?exerciseId={id}&resolution={resolution}
    // Resolution: 180 (BASIC), 360 (PRO), 720 (ULTRA), 1080 (MEGA)
    // Include API key as query param for React Native Image component (can't send headers)
    const gifUrl = `${BASE_URL}/image?exerciseId=${id}&resolution=360&rapidapi-key=${RAPID_API_KEY}`;
    console.log('🖼️ Constructed GIF URL:', gifUrl.replace(RAPID_API_KEY || '', 'API_KEY_HIDDEN'));

    return {
      ...data,
      gifUrl,
    };
  } catch (error) {
    console.error('❌ Error fetching exercise:', error);
    return null;
  }
};

/**
 * Get exercises by target muscle
 */
export const getExercisesByTarget = async (target: string): Promise<Exercise[]> => {
  try {
    console.log('🎯 Fetching exercises for target:', target);
    const data = await apiFetch(`/exercises/target/${target}`);
    console.log(`✅ Found ${data.length} exercises for target:`, target);

    // Add gifUrl with API key query parameter
    return data.map((exercise: any) => ({
      ...exercise,
      gifUrl: `${BASE_URL}/image?exerciseId=${exercise.id}&resolution=360&rapidapi-key=${RAPID_API_KEY}`,
    }));
  } catch (error) {
    console.error('❌ Error fetching target exercises:', error);
    return [];
  }
};

/**
 * Get exercises by body part
 */
export const getExercisesByBodyPart = async (bodyPart: string): Promise<Exercise[]> => {
  try {
    console.log('💪 Fetching exercises for body part:', bodyPart);
    const data = await apiFetch(`/exercises/bodyPart/${bodyPart}`);
    console.log(`✅ Found ${data.length} exercises for body part:`, bodyPart);

    // Add gifUrl with API key query parameter
    return data.map((exercise: any) => ({
      ...exercise,
      gifUrl: `${BASE_URL}/image?exerciseId=${exercise.id}&resolution=360&rapidapi-key=${RAPID_API_KEY}`,
    }));
  } catch (error) {
    console.error('❌ Error fetching body part exercises:', error);
    return [];
  }
};

/**
 * Get exercises by equipment
 */
export const getExercisesByEquipment = async (equipment: string): Promise<Exercise[]> => {
  try {
    console.log('🔧 Fetching exercises for equipment:', equipment);
    const data = await apiFetch(`/exercises/equipment/${equipment}`);
    console.log(`✅ Found ${data.length} exercises for equipment:`, equipment);

    // Add gifUrl with API key query parameter
    return data.map((exercise: any) => ({
      ...exercise,
      gifUrl: `${BASE_URL}/image?exerciseId=${exercise.id}&resolution=360&rapidapi-key=${RAPID_API_KEY}`,
    }));
  } catch (error) {
    console.error('❌ Error fetching equipment exercises:', error);
    return [];
  }
};

/**
 * Get exercises with optional filters
 * Note: This fetches ALL exercises and filters locally to avoid multiple API calls
 */
export const getExercises = async (filters: ExerciseFilters = {}): Promise<Exercise[]> => {
  try {
    console.log('📋 Fetching exercises with filters:', filters);
    console.log('🔑 API Key configured:', RAPID_API_KEY ? 'Yes' : 'No');
    
    // If specific filter is provided, use the optimized endpoint
    if (filters.bodyPart && !filters.equipment && !filters.target) {
      console.log('🎯 Using bodyPart filter endpoint');
      return await getExercisesByBodyPart(filters.bodyPart);
    }
    if (filters.target && !filters.bodyPart && !filters.equipment) {
      console.log('🎯 Using target filter endpoint');
      return await getExercisesByTarget(filters.target);
    }
    if (filters.equipment && !filters.bodyPart && !filters.target) {
      console.log('🎯 Using equipment filter endpoint');
      return await getExercisesByEquipment(filters.equipment);
    }
    
    // For multiple filters or no filters, get all and filter locally
    console.log('📡 Fetching all exercises from API...');
    const allExercises = await apiFetch('/exercises');
    
    if (!allExercises || !Array.isArray(allExercises)) {
      console.error('❌ Invalid response from API:', allExercises);
      return [];
    }
    
    console.log(`✅ Fetched ${allExercises.length} exercises from API`);

    // ExerciseDB API doesn't include gifUrl, construct it with API key query param
    const exercisesWithGifs = allExercises.map((exercise: any) => ({
      ...exercise,
      gifUrl: `${BASE_URL}/image?exerciseId=${exercise.id}&resolution=360&rapidapi-key=${RAPID_API_KEY}`,
    }));
    
    // Log first exercise to see structure
    if (exercisesWithGifs.length > 0) {
      console.log('📋 Sample exercise with GIF:', {
        id: exercisesWithGifs[0].id,
        name: exercisesWithGifs[0].name,
        gifUrl: exercisesWithGifs[0].gifUrl,
        target: exercisesWithGifs[0].target,
        equipment: exercisesWithGifs[0].equipment,
      });
    }
    
    // Apply filters
    let filtered = exercisesWithGifs;
    
    if (filters.bodyPart) {
      filtered = filtered.filter((ex: Exercise) => 
        ex.bodyPart.toLowerCase() === filters.bodyPart?.toLowerCase()
      );
    }
    
    if (filters.equipment) {
      filtered = filtered.filter((ex: Exercise) => 
        ex.equipment.toLowerCase() === filters.equipment?.toLowerCase()
      );
    }
    
    if (filters.target) {
      filtered = filtered.filter((ex: Exercise) => 
        ex.target.toLowerCase() === filters.target?.toLowerCase()
      );
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((ex: Exercise) => 
        ex.name.toLowerCase().includes(searchLower) ||
        ex.target.toLowerCase().includes(searchLower) ||
        ex.bodyPart.toLowerCase().includes(searchLower)
      );
    }
    
    console.log(`✅ Filtered to ${filtered.length} exercises`);
    return filtered;
  } catch (error) {
    console.error('❌ Error fetching exercises:', error);
    return [];
  }
};

/**
 * Get list of available body parts
 */
export const getBodyPartList = async (): Promise<string[]> => {
  try {
    console.log('📝 Fetching body part list');
    const data = await apiFetch('/exercises/bodyPartList');
    console.log(`✅ Found ${data.length} body parts`);
    return data;
  } catch (error) {
    console.error('❌ Error fetching body parts:', error);
    return [];
  }
};

/**
 * Get list of available equipment types
 */
export const getEquipmentList = async (): Promise<string[]> => {
  try {
    console.log('🔧 Fetching equipment list');
    const data = await apiFetch('/exercises/equipmentList');
    console.log(`✅ Found ${data.length} equipment types`);
    return data;
  } catch (error) {
    console.error('❌ Error fetching equipment:', error);
    return [];
  }
};

/**
 * Get list of available target muscles
 */
export const getTargetList = async (): Promise<string[]> => {
  try {
    console.log('🎯 Fetching target list');
    const data = await apiFetch('/exercises/targetList');
    console.log(`✅ Found ${data.length} target muscles`);
    return data;
  } catch (error) {
    console.error('❌ Error fetching targets:', error);
    return [];
  }
};
