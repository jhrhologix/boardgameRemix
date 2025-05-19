import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

const usernames = [
  'Meeplemaster',
  'DiceMaiden',
  'StrategyLord',
  'CardShuffler',
  'BoardwalkEmpress',
  'TokenKeeper',
  'RollMaster',
  'TilePlacer',
  'VictoryPointHunter',
  'ResourceGatherer',
  'GameMechanist',
  'TableTopTitan',
  'CubeQueen',
  'DeckBuilder',
  'AnalysisParalysis',
  'MoveOptimizer',
  'RulebookSage',
  'WorkerPlacer',
  'ChitCollector',
  'HexNavigator',
  'CardSleever',
  'DiceWhisperer',
  'TokenCrafter',
  'StrategySeeker',
  'BoardGameBard',
  'MeepleShepherd',
  'ResourceBaron',
  'TurnTracker',
  'VictoryCounter',
  'GameTheoriest',
  'TableFlipper',
  'CubeKing',
  'DeckShuffler',
  'ActionSelector',
  'MoveCalculator',
  'RulebookScribe',
  'WorkerManager',
  'ChitSorter',
  'HexExplorer',
  'CardProtector',
  'DiceRoller',
  'TokenMaster',
  'StrategyWizard',
  'BoardGameSage',
  'MeepleKeeper',
  'ResourceTrader',
  'TurnMaster',
  'VictorySeeker',
  'GamePhilosopher',
  'TableGuardian',
  'CubeMaster',
  'DeckMaster',
  'ActionOptimizer',
  'MovePlanner',
  'RulebookMaster',
  'WorkerOptimizer',
  'ChitMaster',
  'HexMaster',
  'CardMaster',
  'DiceMaster',
  'TokenSage',
  'StrategyMaster',
  'BoardGameMaster',
  'MeepleWizard',
  'ResourceMaster',
  'TurnWizard',
  'VictoryMaster',
  'GameMaster',
  'TableMaster',
  'CubeWizard',
  'DeckWizard',
  'ActionMaster',
  'MoveWizard',
  'RulebookWizard',
  'WorkerWizard',
  'ChitWizard',
  'HexWizard',
  'CardWizard',
  'DiceWizard',
  'TokenWizard',
  'StrategyGuru',
  'BoardGameGuru',
  'MeepleGuru',
  'ResourceGuru',
  'TurnGuru',
  'VictoryGuru',
  'GameGuru',
  'TableGuru',
  'CubeGuru',
  'DeckGuru',
  'ActionGuru',
  'MoveGuru',
  'RulebookGuru',
  'WorkerGuru',
  'ChitGuru',
  'HexGuru',
  'CardGuru',
  'DiceGuru',
  'TokenGuru',
  'StrategyNinja',
  'BoardGameNinja',
  'MeepleNinja',
  'ResourceNinja',
  'TurnNinja',
]

async function generateUsers() {
  const supabase = createClient()

  try {
    console.log('Starting user generation...')

    for (const username of usernames) {
      const userId = uuidv4()
      const email = `${username.toLowerCase()}@example.com`

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: 'password123', // You should use a more secure password in production
        email_confirm: true,
        user_metadata: {
          username: username
        }
      })

      if (authError) {
        console.error(`Error creating auth user ${username}:`, authError)
        continue
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: username,
          avatar_url: null,
          bio: `Passionate board game enthusiast and strategy lover.`,
          created_at: new Date().toISOString()
        })

      if (profileError) {
        console.error(`Error creating profile for ${username}:`, profileError)
        continue
      }

      console.log(`Created user: ${username}`)
    }

    console.log('User generation completed!')
  } catch (error) {
    console.error('Error in user generation:', error)
  }
}

generateUsers() 