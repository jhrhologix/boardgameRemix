import { createClient } from '@supabase/supabase-js'

async function addPandemicRemix() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    console.log('Starting to add Pandemic Legacy remix...')

    // Get the current user's ID
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Create the remix
    const { data: remix, error: remixError } = await supabase
      .from('remixes')
      .insert({
        title: 'Pandemic Legacy: One Night (Revised)',
        description: 'A thrilling combination of Pandemic Legacy and One Night Ultimate Werewolf, featuring hidden traitors and disease control.',
        rules: `In this remix, players fight global diseases as in Pandemic Legacy, but with a hidden traitor element. At the start of each month (game), players receive secret role cards as in One Night Ultimate Werewolf. Most are CDC operatives with special abilities (Medic, Scientist, Dispatcher, etc.), but one player secretly receives the Bioterrorist role.

Setup Phase:
- Distribute role cards face-down
- The Bioterrorist secretly notes one city where they'll place an extra infection cube
- During a brief "night phase" with eyes closed, special investigative roles may perform limited information-gathering actions

Gameplay:
- The game proceeds as standard Pandemic Legacy cooperative play
- The Bioterrorist must participate as a seemingly loyal team member while subtly sabotaging efforts
- The Bioterrorist gets one secret action per round that appears to be regular game effects:
  - Place an extra infection cube when drawing infection cards
  - Manipulate the player deck to bring epidemic cards closer
  - Discard critical city cards from the discard pile
  - Claim to have played the wrong card "by mistake"

Victory/Defeat Conditions:
- If the team successfully completes the month's objectives, the cooperative team wins and the Bioterrorist loses
- If the team fails to meet objectives (too many outbreaks, etc.), the Bioterrorist wins
- At any point, players can call for a vote if they suspect someone is the Bioterrorist
- If the team correctly identifies the Bioterrorist, they are removed from play and the team continues with a difficulty adjustment
- If the team incorrectly identifies a loyal member, that player is removed AND the Bioterrorist gets an additional sabotage action each round`,
        setup_instructions: `1. Set up Pandemic Legacy as normal for the current month
2. Shuffle and deal role cards face-down to each player
3. Allow Bioterrorist to secretly mark their target city
4. Conduct night phase for special role actions
5. Begin standard Pandemic Legacy play with hidden traitor mechanics`,
        difficulty: 'hard',
        max_players: 5,
        user_id: user.id
      })
      .select()
      .single()

    if (remixError) throw remixError
    if (!remix) throw new Error('Failed to create remix')

    console.log('Created remix:', remix)

    // Add the games
    const games = [
      {
        name: 'Pandemic Legacy: Season 1',
        bgg_id: '161936',
        year_published: 2015,
        image_url: 'https://cf.geekdo-images.com/hxmcDJRwQA1L3COhzhGq8Q/original/img/mnfhxZNnPE2t7KYzIL0sD8YhSQE=/0x0/filters:format(jpeg)/pic2452831.jpg',
        bgg_url: 'https://boardgamegeek.com/boardgame/161936/pandemic-legacy-season-1'
      },
      {
        name: 'One Night Ultimate Werewolf',
        bgg_id: '147949',
        year_published: 2014,
        image_url: 'https://cf.geekdo-images.com/KLDb0vR3w8mfaHgIGF0gHw/original/img/qv0WkrvjMxWWyaZLVNJF9KV4JLU=/0x0/filters:format(jpeg)/pic2055222.jpg',
        bgg_url: 'https://boardgamegeek.com/boardgame/147949/one-night-ultimate-werewolf'
      }
    ]

    // Add games and create relationships
    for (const game of games) {
      // Check if game exists
      let { data: existingGame } = await supabase
        .from('bgg_games')
        .select()
        .eq('bgg_id', game.bgg_id)
        .single()

      let gameId
      if (existingGame) {
        gameId = existingGame.id
      } else {
        // Create new game
        const { data: newGame, error: gameError } = await supabase
          .from('bgg_games')
          .insert(game)
          .select()
          .single()

        if (gameError) throw gameError
        if (!newGame) throw new Error(`Failed to create game ${game.name}`)
        gameId = newGame.id
      }

      // Create relationship
      const { error: relError } = await supabase
        .from('remix_games')
        .insert({
          remix_id: remix.id,
          bgg_game_id: gameId
        })

      if (relError) throw relError
    }

    // Add hashtags
    const hashtags = ['strategy', 'cooperative', 'traitor', 'legacy', 'hidden-role']
    for (const tag of hashtags) {
      // Check if hashtag exists
      let { data: existingTag } = await supabase
        .from('hashtags')
        .select()
        .eq('name', tag)
        .single()

      let tagId
      if (existingTag) {
        tagId = existingTag.id
      } else {
        // Create new hashtag
        const { data: newTag, error: tagError } = await supabase
          .from('hashtags')
          .insert({ name: tag })
          .select()
          .single()

        if (tagError) throw tagError
        if (!newTag) throw new Error(`Failed to create hashtag ${tag}`)
        tagId = newTag.id
      }

      // Create relationship
      const { error: relError } = await supabase
        .from('remix_hashtags')
        .insert({
          remix_id: remix.id,
          hashtag_id: tagId
        })

      if (relError) throw relError
    }

    console.log('Successfully added Pandemic Legacy remix with all relationships!')
  } catch (error) {
    console.error('Error adding remix:', error)
  }
}

addPandemicRemix() 