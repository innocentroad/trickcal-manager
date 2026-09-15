(() => {
  'use strict';

  // 共有URLのIDは追記専用。既存の番号を並べ替えたり再利用したりしない。
  // 新しいIDは各配列の末尾へ追加し、CATALOG_VERSIONを変更しない。
  const catalog = {
    version: 1,
    apostles: [
      'Amelia', 'Aya', 'Alice', 'Allet', 'ED', 'Ifrit', 'Ui', 'Vivi', 'Ashur', 'Espi',
      'Epica', 'Erpin', 'Elena', 'Gabia', 'Carren', 'Canna', 'Kidian', 'Kyarot', 'Kyuri', 'Chloe',
      'Kommy', 'Sari', 'Sylla', 'Shaydi', 'Jade', 'Xion', 'Sist', 'Shoupan', 'Jubee', 'Silphir',
      'Snorky', 'Speaki', 'Selene', 'Daya', 'Taida', 'Chopi', 'Diana', 'Tig', 'Naia', 'Ner',
      'Butter', 'Patula', 'Barong', 'Picora', 'BigWood', 'Pira', 'Hilde', 'Festa', 'Blanchet', 'Fricle',
      'Haley', 'Beni', 'Belita', 'Veroo', 'Velvet', 'Posher', 'Mago', 'MaestroMK2', 'Mayo', 'Marie',
      'Mynx', 'Maison', 'Meluna', 'Momo', 'Yumimi', 'Yomi', 'Risty', 'Leets', 'Renewa', 'Rim',
      'Rudd', 'Rufo', 'Layze', 'Levi', 'Rohne', 'Rollett', 'Barie', 'Sherum'
    ],
    artifacts: [
      'artifact_yomi_moonflower', 'artifact_erpin_ice_cream_cake', 'artifact_butter_yellow_card',
      'artifact_vivi_silver_staff', 'artifact_elena_enhanced_drone', 'artifact_leets_worn_whetstone',
      'artifact_blanchet_bouquet', 'artifact_picora_fashion_pouch', 'artifact_xion_black_cape',
      'artifact_naia_dolphin_watergun', 'artifact_shoupan_magical_backpack', 'artifact_snorky_fedora',
      'artifact_selene_midnight_mirage', 'artifact_kyarot_sugarcane', 'artifact_chloe_sewing_chest',
      'artifact_risty_replica_glove', 'artifact_barong_cursed_doll', 'artifact_tig_blazing_sword',
      'artifact_rudd_exercise_manual', 'artifact_rollett_magic_hat', 'artifact_pira_gleaming_business_card',
      'artifact_dragonlight_sword', 'artifact_life_gem', 'artifact_30kg_kettlebell', 'artifact_mithril_knife',
      'artifact_fluffy_vest', 'artifact_eldyne_lamp', 'artifact_assassin_scroll', 'artifact_sword_and_staff',
      'artifact_safety_harness', 'artifact_combat_manual', 'artifact_jade_codex', 'artifact_scale_armor',
      'artifact_blessed_pauldrons', 'artifact_chalice_of_origins', 'artifact_grail_of_origins',
      'artifact_fanatic_mask', 'artifact_healing_pendant', 'artifact_obsidian_shuriken', 'artifact_ring_of_greed',
      'artifact_old_wooden_dagger', 'artifact_elven_wand', 'artifact_gemstone_ring', 'artifact_crown_of_thorns',
      'artifact_weathered_arrow', 'artifact_icy_charm', 'artifact_cotton_cloak', 'artifact_shining_tiara',
      'artifact_cardboard_armor', 'artifact_head_wrap',
      'artifact_rusty_awl', 'artifact_sherum_parchment_scroll'
    ],
    spells: [
      'spell_alice_fake_magic', 'spell_epica_hero_exaltation', 'spell_luc_ed_dream',
      'spell_renewa_time_paradox', 'spell_aya_snowflake_magic', 'spell_fatal_charm',
      'spell_strange_elixir', 'spell_combat_master', 'spell_aroma_therapy', 'spell_cheer_up',
      'spell_warm_hearted', 'spell_stealth_slacker', 'spell_vanguard', 'spell_rear_guard',
      'spell_personality_mad', 'spell_personality_vivacious', 'spell_personality_innocent',
      'spell_personality_depressed', 'spell_personality_composed', 'spell_swift_move',
      'spell_firm_belief', 'spell_fatal_blow', 'spell_keeping_fit', 'spell_bulletproof',
      'spell_robust_health', 'spell_where_you_lookin', 'spell_personal_training', 'spell_empower',
      'spell_wizard_apprentice', 'spell_get_her', 'spell_random_coin', 'spell_big_tree_bark',
      'spell_trainee', 'spell_soda_capsule', 'spell_strawberry_capsule'
    ],
    masterPowers: [
      'masterpower_punishment', 'masterpower_shield', 'masterpower_acceleration',
      'masterpower_blanket', 'masterpower_poppin', 'masterpower_strike'
    ]
  };

  Object.values(catalog).forEach(value => {
    if (Array.isArray(value)) Object.freeze(value);
  });
  Object.freeze(catalog);
  const globalObject = typeof globalThis !== 'undefined' ? globalThis : {};
  globalObject.TRICKCAL_FORMATION_SHARE_CATALOG = catalog;
  if (typeof module !== 'undefined' && module.exports) module.exports = catalog;
})();
