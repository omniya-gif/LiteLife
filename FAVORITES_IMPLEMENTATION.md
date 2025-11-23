# Recipe Favorites Implementation - Supabase Integration

## Overview
Successfully migrated recipe favorites from AsyncStorage to Supabase with automatic Spoonacular user creation.

## Implementation Details

### 1. Spoonacular API Integration (`services/recipeService.ts`)

Added three new functions:

#### `connectSpoonacularUser(username: string, email: string)`
- Connects user to Spoonacular API via `/users/connect` endpoint
- Returns `{ username, hash }` credentials
- Used for creating Spoonacular user account

#### `getRecipesBulk(ids: number[])`
- Fetches multiple recipes by IDs in a single API call
- Endpoint: `/recipes/informationBulk?ids=1,2,3`
- Includes nutrition data with `includeNutrition=true`
- Used for loading favorite recipes efficiently

### 2. Favorites Hook (`hooks/useRecipeFavorites.ts`)

#### Features:
- **Automatic Spoonacular user creation**: Creates username/hash on first favorite
- **Supabase storage**: Stores favorites in `recipe_favorites` table
- **AsyncStorage migration**: Automatically migrates existing favorites on mount
- **Real-time state management**: Updates local state immediately

#### Functions:
```typescript
const {
  favorites,           // Array<Recipe> - Full recipe data
  favoriteIds,         // Array<number> - Recipe IDs for quick checks
  isLoading,           // boolean - Loading state
  error,               // string | null - Error message
  addToFavorites,      // (recipe: Recipe) => Promise<void>
  removeFromFavorites, // (recipeId: number) => Promise<void>
  isFavorite,          // (recipeId: number) => boolean
  refreshFavorites,    // () => Promise<void>
} = useRecipeFavorites();
```

#### Spoonacular User Creation Flow:
1. Check if user has `spoonacular_username` and `spoonacular_hash` in profile
2. If not, generate username from email (e.g., `user@email.com` → `user`)
3. Call Spoonacular Connect API: `POST /users/connect`
4. Save returned credentials to `profiles` table
5. All subsequent favorites use these credentials

#### AsyncStorage Migration:
- Runs automatically on first load when user is signed in
- Checks for `favoriteRecipes` key in AsyncStorage
- Fetches recipe IDs and filters out duplicates already in Supabase
- Bulk fetches full recipe data from Spoonacular
- Inserts into `recipe_favorites` table
- Clears AsyncStorage after successful migration

### 3. UI Updates (`app/(main)/recipes/index.tsx`)

#### Changes:
- ✅ Removed AsyncStorage import
- ✅ Replaced `favorites` state with `useRecipeFavorites` hook
- ✅ Updated `toggleFavorite` to use `addToFavorites`/`removeFromFavorites`
- ✅ Changed function signature: `toggleFavorite(recipe: Recipe)` instead of `(id: number)`
- ✅ Updated Heart icons: `isFavorite(recipe.id)` instead of `favorites.includes(recipe.id)`
- ✅ Added favorites error display with yellow alert banner

#### Before:
```typescript
const [favorites, setFavorites] = useState<number[]>([]);

const toggleFavorite = async (id: number) => {
  const newFavorites = favorites.includes(id)
    ? favorites.filter((fid) => fid !== id)
    : [...favorites, id];
  setFavorites(newFavorites);
  await AsyncStorage.setItem('favoriteRecipes', JSON.stringify(newFavorites));
};

<Heart color={favorites.includes(recipe.id) ? theme.primary : 'white'} />
```

#### After:
```typescript
const { addToFavorites, removeFromFavorites, isFavorite, error: favoritesError } = useRecipeFavorites();

const toggleFavorite = async (recipe: Recipe) => {
  try {
    if (isFavorite(recipe.id)) {
      await removeFromFavorites(recipe.id);
    } else {
      await addToFavorites(recipe);
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to update favorites.');
  }
};

<Heart color={isFavorite(recipe.id) ? theme.primary : 'white'} />
```

### 4. Migration Utility (`utils/favoriteMigration.ts`)

Standalone migration utility (optional, hook handles it automatically):

```typescript
import { migrateFavoritesToSupabase } from '../utils/favoriteMigration';

// Manual migration
await migrateFavoritesToSupabase(userId);

// Check and migrate if needed
await checkAndMigrateFavorites(userId);
```

## Database Schema

### `profiles` table:
```sql
- id: uuid (FK to auth.users)
- spoonacular_username: text
- spoonacular_hash: text
- username: text
- avatar_url: text
- expo_push_token: text
```

### `recipe_favorites` table:
```sql
- id: uuid (PK)
- user_id: uuid (FK to profiles.id)
- recipe_id: integer (Spoonacular recipe ID)
- recipe_data: jsonb (cached recipe object)
- created_at: timestamptz
```

## API Endpoints Used

### Spoonacular Connect API:
```
POST https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/users/connect
Body: { username: string, email: string }
Response: { username: string, hash: string, spoonacularPassword: string }
```

### Bulk Recipe Fetch:
```
GET https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/informationBulk?ids=1,2,3&includeNutrition=true
Response: Array<Recipe>
```

## Testing Checklist

- [ ] Sign in with existing user
- [ ] Add recipe to favorites (should create Spoonacular user automatically)
- [ ] Check `profiles` table for `spoonacular_username` and `spoonacular_hash`
- [ ] Verify favorite appears in `recipe_favorites` table
- [ ] Remove favorite (should delete from Supabase)
- [ ] Sign out and sign in again (favorites should persist)
- [ ] Test with user who has AsyncStorage favorites (should auto-migrate)
- [ ] Check console logs for migration success messages
- [ ] Verify AsyncStorage is cleared after migration
- [ ] Test favorites across featured recipes and search results

## Success Indicators

✅ No more AsyncStorage usage for favorites
✅ Favorites persist across sessions
✅ Favorites sync across devices (with same user account)
✅ Automatic migration from old storage
✅ Spoonacular user created automatically
✅ Credentials stored securely in Supabase
✅ Error handling with user-friendly messages
✅ Loading states during async operations

## Error Handling

1. **Spoonacular API errors**: Logged to console, favorites still stored in Supabase
2. **Supabase errors**: Shown in yellow alert banner, doesn't block app
3. **Migration errors**: Non-blocking, logged to console
4. **Permission errors**: Alert shown if user not signed in

## Performance Optimizations

- **Bulk fetching**: Single API call for multiple recipes
- **Local state caching**: Immediate UI updates
- **Recipe data caching**: `recipe_data` jsonb field stores full recipe
- **Lazy migration**: Only migrates when user signs in
- **Single fetch on mount**: Fetches all favorites once

## Future Enhancements

- [ ] Add favorites page to view all saved recipes
- [ ] Add recipe collections/folders
- [ ] Sync favorites to Spoonacular account (if implemented)
- [ ] Add "Recently Added" sorting
- [ ] Export/import favorites
- [ ] Share favorite collections with other users

## Troubleshooting

### Favorites not persisting:
- Check if user is signed in
- Verify Supabase connection
- Check RLS policies on `recipe_favorites` table

### Spoonacular user not created:
- Check RapidAPI credentials
- Verify `/users/connect` endpoint is accessible
- Check console logs for API errors

### Migration not working:
- Check AsyncStorage for `favoriteRecipes` key
- Verify user ID is valid
- Check network connectivity
- Look for console errors during migration

## Related Files

- `services/recipeService.ts` - API integration
- `hooks/useRecipeFavorites.ts` - Main favorites hook
- `app/(main)/recipes/index.tsx` - Recipe list UI
- `utils/favoriteMigration.ts` - Migration utility
- `lib/supabase.ts` - Supabase client
- `supabase/migrations/` - Database schema

## Reference Implementation

Web version reference: `reference_favourite-spoonacular-user/foodieland/`
- `src/hooks/useFavorites.ts` - React Query implementation
- `src/services/spoonacularApi.ts` - API integration
- `supabase/migrations/` - Database migrations
