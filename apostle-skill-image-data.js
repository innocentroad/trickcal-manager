(() => {
  'use strict';
  const imageData = Object.freeze({
  "Alice": {
    "high": "img/Chara/Skill/Skill_S_Alice.webp",
    "low": "img/Chara/Skill/Skill_F_Alice.webp",
    "passive": "img/Chara/Skill/Skill_P_Alice.webp"
  },
  "Allet": {
    "high": "img/Chara/Skill/Skill_S_Allet.webp",
    "low": "img/Chara/Skill/Skill_F_Allet.webp",
    "passive": "img/Chara/Skill/Skill_P_Allet.webp"
  },
  "Amelia": {
    "high": "img/Chara/Skill/Skill_S_Amelia.webp",
    "low": "img/Chara/Skill/Skill_F_Amelia.webp",
    "passive": "img/Chara/Skill/Skill_P_Amelia.webp"
  },
  "Ashur": {
    "high": "img/Chara/Skill/Skill_S_Ashur.webp",
    "low": "img/Chara/Skill/Skill_F_Ashur.webp",
    "passive": "img/Chara/Skill/Skill_P_Ashur.webp"
  },
  "Aya": {
    "high": "img/Chara/Skill/Skill_S_Aya.webp",
    "low": "img/Chara/Skill/Skill_F_Aya.webp",
    "passive": "img/Chara/Skill/Skill_P_Aya.webp"
  },
  "Barie": {
    "high": "img/Chara/Skill/Skill_S_Barie.webp",
    "low": "img/Chara/Skill/Skill_F_Barie.webp",
    "passive": "img/Chara/Skill/Skill_P_Barie.webp"
  },
  "Barong": {
    "high": "img/Chara/Skill/Skill_S_Barong.webp",
    "low": "img/Chara/Skill/Skill_F_Barong.webp",
    "passive": "img/Chara/Skill/Skill_P_Barong.webp"
  },
  "Belita": {
    "high": "img/Chara/Skill/Skill_S_Belita.webp",
    "low": "img/Chara/Skill/Skill_F_Belita.webp",
    "passive": "img/Chara/Skill/Skill_P_Belita.webp"
  },
  "Beni": {
    "high": "img/Chara/Skill/Skill_S_Beni.webp",
    "low": "img/Chara/Skill/Skill_F_Beni.webp",
    "passive": "img/Chara/Skill/Skill_P_Beni.webp"
  },
  "BigWood": {
    "high": "img/Chara/Skill/Skill_S_BigWood.webp",
    "low": "img/Chara/Skill/Skill_F_BigWood.webp",
    "passive": "img/Chara/Skill/Skill_P_BigWood.webp"
  },
  "Blanchet": {
    "high": "img/Chara/Skill/Skill_S_Blanchet.webp",
    "low": "img/Chara/Skill/Skill_F_Blanchet.webp",
    "passive": "img/Chara/Skill/Skill_P_Blanchet.webp"
  },
  "Butter": {
    "high": "img/Chara/Skill/Skill_S_Butter.webp",
    "low": "img/Chara/Skill/Skill_F_Butter.webp",
    "passive": "img/Chara/Skill/Skill_P_Butter.webp"
  },
  "Canna": {
    "high": "img/Chara/Skill/Skill_S_Canna.webp",
    "low": "img/Chara/Skill/Skill_F_Canna.webp",
    "passive": "img/Chara/Skill/Skill_P_Canna.webp"
  },
  "Carren": {
    "high": "img/Chara/Skill/Skill_S_Carren.webp",
    "low": "img/Chara/Skill/Skill_F_Carren.webp",
    "passive": "img/Chara/Skill/Skill_P_Carren.webp"
  },
  "Chloe": {
    "high": "img/Chara/Skill/Skill_S_Chloe.webp",
    "low": "img/Chara/Skill/Skill_F_Chloe.webp",
    "passive": "img/Chara/Skill/Skill_P_Chloe.webp"
  },
  "Chopi": {
    "high": "img/Chara/Skill/Skill_S_Chopi.webp",
    "low": "img/Chara/Skill/Skill_F_Chopi.webp",
    "passive": "img/Chara/Skill/Skill_P_Chopi.webp"
  },
  "Daya": {
    "high": "img/Chara/Skill/Skill_S_Daya.webp",
    "low": "img/Chara/Skill/Skill_F_Daya.webp",
    "passive": "img/Chara/Skill/Skill_P_Daya.webp"
  },
  "Diana": {
    "high": "img/Chara/Skill/Skill_S_Diana.webp",
    "low": "img/Chara/Skill/Skill_F_Diana.webp",
    "passive": "img/Chara/Skill/Skill_P_Diana.webp"
  },
  "Ed": {
    "high": "img/Chara/Skill/Skill_S_Ed.webp",
    "low": "img/Chara/Skill/Skill_F_Ed.webp",
    "passive": "img/Chara/Skill/Skill_P_Ed.webp"
  },
  "Elena": {
    "high": "img/Chara/Skill/Skill_S_Elena.webp",
    "low": "img/Chara/Skill/Skill_F_Elena.webp",
    "passive": "img/Chara/Skill/Skill_P_Elena.webp"
  },
  "Epica": {
    "high": "img/Chara/Skill/Skill_S_Epica.webp",
    "low": "img/Chara/Skill/Skill_F_Epica.webp",
    "passive": "img/Chara/Skill/Skill_P_Epica.webp"
  },
  "Erpin": {
    "high": "img/Chara/Skill/Skill_S_Erpin.webp",
    "low": "img/Chara/Skill/Skill_F_Erpin.webp",
    "passive": "img/Chara/Skill/Skill_P_Erpin.webp"
  },
  "Espi": {
    "high": "img/Chara/Skill/Skill_S_Espi.webp",
    "low": "img/Chara/Skill/Skill_F_Espi.webp",
    "passive": "img/Chara/Skill/Skill_P_Espi.webp"
  },
  "Festa": {
    "high": "img/Chara/Skill/Skill_S_Festa.webp",
    "low": "img/Chara/Skill/Skill_F_Festa.webp",
    "passive": "img/Chara/Skill/Skill_P_Festa.webp"
  },
  "Fricle": {
    "high": "img/Chara/Skill/Skill_S_Fricle.webp",
    "low": "img/Chara/Skill/Skill_F_Fricle.webp",
    "passive": "img/Chara/Skill/Skill_P_Fricle.webp"
  },
  "Gabia": {
    "high": "img/Chara/Skill/Skill_S_Gabia.webp",
    "low": "img/Chara/Skill/Skill_F_Gabia.webp",
    "passive": "img/Chara/Skill/Skill_P_Gabia.webp"
  },
  "Haley": {
    "high": "img/Chara/Skill/Skill_S_Haley.webp",
    "low": "img/Chara/Skill/Skill_F_Haley.webp",
    "passive": "img/Chara/Skill/Skill_P_Haley.webp"
  },
  "Hilde": {
    "high": "img/Chara/Skill/Skill_S_Hilde.webp",
    "low": "img/Chara/Skill/Skill_F_Hilde.webp",
    "passive": "img/Chara/Skill/Skill_P_Hilde.webp"
  },
  "Ifrit": {
    "high": "img/Chara/Skill/Skill_S_Ifrit.webp",
    "low": "img/Chara/Skill/Skill_F_Ifrit.webp",
    "passive": "img/Chara/Skill/Skill_P_Ifrit.webp"
  },
  "Jade": {
    "high": "img/Chara/Skill/Skill_S_Jade.webp",
    "low": "img/Chara/Skill/Skill_F_Jade.webp",
    "passive": "img/Chara/Skill/Skill_P_Jade.webp"
  },
  "Joanne": {
    "high": "img/Chara/Skill/Icon_GraduateSkill_Joanne.webp",
    "low": "img/Chara/Skill/Icon_AdmissionSkill_Joanne.webp"
  },
  "Jubee": {
    "high": "img/Chara/Skill/Skill_S_Jubee.webp",
    "low": "img/Chara/Skill/Skill_F_Jubee.webp",
    "passive": "img/Chara/Skill/Skill_P_Jubee.webp"
  },
  "Kidian": {
    "high": "img/Chara/Skill/Skill_S_Kidian.webp",
    "low": "img/Chara/Skill/Skill_F_Kidian.webp",
    "passive": "img/Chara/Skill/Skill_P_Kidian.webp"
  },
  "Kommy": {
    "high": "img/Chara/Skill/Skill_S_Kommy.webp",
    "low": "img/Chara/Skill/Skill_F_Kommy.webp",
    "passive": "img/Chara/Skill/Skill_P_Kommy.webp"
  },
  "Kyarot": {
    "high": "img/Chara/Skill/Skill_S_Kyarot.webp",
    "low": "img/Chara/Skill/Skill_F_Kyarot.webp",
    "passive": "img/Chara/Skill/Skill_P_Kyarot.webp"
  },
  "Kyuri": {
    "high": "img/Chara/Skill/Skill_S_Kyuri.webp",
    "low": "img/Chara/Skill/Skill_F_Kyuri.webp",
    "passive": "img/Chara/Skill/Skill_P_Kyuri.webp"
  },
  "Layze": {
    "high": "img/Chara/Skill/Skill_S_Layze.webp",
    "low": "img/Chara/Skill/Skill_F_Layze.webp",
    "passive": "img/Chara/Skill/Skill_P_Layze.webp"
  },
  "Leets": {
    "high": "img/Chara/Skill/Skill_S_Leets.webp",
    "low": "img/Chara/Skill/Skill_F_Leets.webp",
    "passive": "img/Chara/Skill/Skill_P_Leets.webp"
  },
  "Levi": {
    "high": "img/Chara/Skill/Skill_S_Levi.webp",
    "low": "img/Chara/Skill/Skill_F_Levi.webp",
    "passive": "img/Chara/Skill/Skill_P_Levi.webp"
  },
  "MaestroMK2": {
    "high": "img/Chara/Skill/Skill_S_MaestroMK2.webp",
    "low": "img/Chara/Skill/Skill_F_MaestroMK2.webp",
    "passive": "img/Chara/Skill/Skill_P_MaestroMK2.webp"
  },
  "Mago": {
    "high": "img/Chara/Skill/Skill_S_Mago.webp",
    "low": "img/Chara/Skill/Skill_F_Mago.webp",
    "passive": "img/Chara/Skill/Skill_P_Mago.webp"
  },
  "Maison": {
    "high": "img/Chara/Skill/Skill_S_Maison.webp",
    "low": "img/Chara/Skill/Skill_F_Maison.webp",
    "passive": "img/Chara/Skill/Skill_P_Maison.webp"
  },
  "Marie": {
    "high": "img/Chara/Skill/Skill_S_Marie.webp",
    "low": "img/Chara/Skill/Skill_F_Marie.webp",
    "passive": "img/Chara/Skill/Skill_P_Marie.webp"
  },
  "Mayo": {
    "high": "img/Chara/Skill/Skill_S_Mayo.webp",
    "low": "img/Chara/Skill/Skill_F_Mayo.webp",
    "passive": "img/Chara/Skill/Skill_P_Mayo.webp"
  },
  "Meluna": {
    "high": "img/Chara/Skill/Skill_S_Meluna.webp",
    "low": "img/Chara/Skill/Skill_F_Meluna.webp",
    "passive": "img/Chara/Skill/Skill_P_Meluna.webp"
  },
  "Momo": {
    "high": "img/Chara/Skill/Skill_S_Momo.webp",
    "low": "img/Chara/Skill/Skill_F_Momo.webp",
    "passive": "img/Chara/Skill/Skill_P_Momo.webp"
  },
  "Mynx": {
    "high": "img/Chara/Skill/Skill_S_Mynx.webp",
    "low": "img/Chara/Skill/Skill_F_Mynx.webp",
    "passive": "img/Chara/Skill/Skill_P_Mynx.webp"
  },
  "Naia": {
    "high": "img/Chara/Skill/Skill_S_Naia.webp",
    "low": "img/Chara/Skill/Skill_F_Naia.webp",
    "passive": "img/Chara/Skill/Skill_P_Naia.webp"
  },
  "Ner": {
    "high": "img/Chara/Skill/Skill_S_Ner.webp",
    "low": "img/Chara/Skill/Skill_F_Ner.webp",
    "passive": "img/Chara/Skill/Skill_P_Ner.webp"
  },
  "Patula": {
    "high": "img/Chara/Skill/Skill_S_Patula.webp",
    "low": "img/Chara/Skill/Skill_F_Patula.webp",
    "passive": "img/Chara/Skill/Skill_P_Patula.webp"
  },
  "Picora": {
    "high": "img/Chara/Skill/Skill_S_Picora.webp",
    "low": "img/Chara/Skill/Skill_F_Picora.webp",
    "passive": "img/Chara/Skill/Skill_P_Picora.webp"
  },
  "Pira": {
    "high": "img/Chara/Skill/Skill_S_Pira.webp",
    "low": "img/Chara/Skill/Skill_F_Pira.webp",
    "passive": "img/Chara/Skill/Skill_P_Pira.webp"
  },
  "Posher": {
    "high": "img/Chara/Skill/Skill_S_Posher.webp",
    "low": "img/Chara/Skill/Skill_F_Posher.webp",
    "passive": "img/Chara/Skill/Skill_P_Posher.webp"
  },
  "Renewa": {
    "high": "img/Chara/Skill/Skill_S_Renewa.webp",
    "low": "img/Chara/Skill/Skill_F_Renewa.webp",
    "passive": "img/Chara/Skill/Skill_P_Renewa.webp"
  },
  "Rim": {
    "high": "img/Chara/Skill/Skill_S_Rim.webp",
    "low": "img/Chara/Skill/Skill_F_Rim.webp",
    "passive": "img/Chara/Skill/Skill_P_Rim.webp"
  },
  "Risty": {
    "high": "img/Chara/Skill/Skill_S_Risty.webp",
    "low": "img/Chara/Skill/Skill_F_Risty.webp",
    "passive": "img/Chara/Skill/Skill_P_Risty.webp"
  },
  "Rohne": {
    "high": "img/Chara/Skill/Skill_S_Rohne.webp",
    "low": "img/Chara/Skill/Skill_F_Rohne.webp",
    "passive": "img/Chara/Skill/Skill_P_Rohne.webp"
  },
  "Rollett": {
    "high": "img/Chara/Skill/Skill_S_Rollett.webp",
    "low": "img/Chara/Skill/Skill_F_Rollett.webp",
    "passive": "img/Chara/Skill/Skill_P_Rollett.webp"
  },
  "Rudd": {
    "high": "img/Chara/Skill/Skill_S_Rudd.webp",
    "low": "img/Chara/Skill/Skill_F_Rudd.webp",
    "passive": "img/Chara/Skill/Skill_P_Rudd.webp"
  },
  "Rude": {
    "high": "img/Chara/Skill/Skill_S_Rude.webp",
    "low": "img/Chara/Skill/Skill_F_Rude.webp",
    "passive": "img/Chara/Skill/Skill_P_Rude.webp"
  },
  "Rufo": {
    "high": "img/Chara/Skill/Skill_S_Rufo.webp",
    "low": "img/Chara/Skill/Skill_F_Rufo.webp",
    "passive": "img/Chara/Skill/Skill_P_Rufo.webp"
  },
  "Sari": {
    "high": "img/Chara/Skill/Skill_S_Sari.webp",
    "low": "img/Chara/Skill/Skill_F_Sari.webp",
    "passive": "img/Chara/Skill/Skill_P_Sari.webp"
  },
  "Selene": {
    "high": "img/Chara/Skill/Skill_S_Selene.webp",
    "low": "img/Chara/Skill/Skill_F_Selene.webp",
    "passive": "img/Chara/Skill/Skill_P_Selene.webp"
  },
  "Shaydi": {
    "high": "img/Chara/Skill/Skill_S_Shaydi.webp",
    "low": "img/Chara/Skill/Skill_F_Shaydi.webp",
    "passive": "img/Chara/Skill/Skill_P_Shaydi.webp"
  },
  "Sherum": {
    "high": "img/Chara/Skill/Skill_S_Sherum.webp",
    "low": "img/Chara/Skill/Skill_F_Sherum.webp",
    "passive": "img/Chara/Skill/Skill_P_Sherum.webp"
  },
  "Shoupan": {
    "high": "img/Chara/Skill/Skill_S_Shoupan.webp",
    "low": "img/Chara/Skill/Skill_F_Shoupan.webp",
    "passive": "img/Chara/Skill/Skill_P_Shoupan.webp"
  },
  "Silphir": {
    "high": "img/Chara/Skill/Skill_S_Silphir.webp",
    "low": "img/Chara/Skill/Skill_F_Silphir.webp",
    "passive": "img/Chara/Skill/Skill_P_Silphir.webp"
  },
  "Sist": {
    "high": "img/Chara/Skill/Skill_S_Sist.webp",
    "low": "img/Chara/Skill/Skill_F_Sist.webp",
    "passive": "img/Chara/Skill/Skill_P_Sist.webp"
  },
  "Snorky": {
    "high": "img/Chara/Skill/Skill_S_Snorky.webp",
    "low": "img/Chara/Skill/Skill_F_Snorky.webp",
    "passive": "img/Chara/Skill/Skill_P_Snorky.webp"
  },
  "Speaki": {
    "high": "img/Chara/Skill/Skill_S_Speaki.webp",
    "low": "img/Chara/Skill/Skill_F_Speaki.webp",
    "passive": "img/Chara/Skill/Skill_P_Speaki.webp"
  },
  "Sylla": {
    "high": "img/Chara/Skill/Skill_S_Sylla.webp",
    "low": "img/Chara/Skill/Skill_F_Sylla.webp",
    "passive": "img/Chara/Skill/Skill_P_Sylla.webp"
  },
  "Taida": {
    "high": "img/Chara/Skill/Skill_S_Taida.webp",
    "low": "img/Chara/Skill/Skill_F_Taida.webp",
    "passive": "img/Chara/Skill/Skill_P_Taida.webp"
  },
  "Tig": {
    "high": "img/Chara/Skill/Skill_S_Tig.webp",
    "low": "img/Chara/Skill/Skill_F_Tig.webp",
    "passive": "img/Chara/Skill/Skill_P_Tig.webp"
  },
  "Ui": {
    "high": "img/Chara/Skill/Skill_S_Ui.webp",
    "low": "img/Chara/Skill/Skill_F_Ui.webp",
    "passive": "img/Chara/Skill/Skill_P_Ui.webp"
  },
  "Velvet": {
    "high": "img/Chara/Skill/Skill_S_Velvet.webp",
    "low": "img/Chara/Skill/Skill_F_Velvet.webp",
    "passive": "img/Chara/Skill/Skill_P_Velvet.webp"
  },
  "Veroo": {
    "high": "img/Chara/Skill/Skill_S_Veroo.webp",
    "low": "img/Chara/Skill/Skill_F_Veroo.webp",
    "passive": "img/Chara/Skill/Skill_P_Veroo.webp"
  },
  "Vivi": {
    "high": "img/Chara/Skill/Skill_S_Vivi.webp",
    "low": "img/Chara/Skill/Skill_F_Vivi.webp",
    "passive": "img/Chara/Skill/Skill_P_Vivi.webp"
  },
  "Xion": {
    "high": "img/Chara/Skill/Skill_S_Xion.webp",
    "low": "img/Chara/Skill/Skill_F_Xion.webp",
    "passive": "img/Chara/Skill/Skill_P_Xion.webp"
  },
  "Yomi": {
    "high": "img/Chara/Skill/Skill_S_Yomi.webp",
    "low": "img/Chara/Skill/Skill_F_Yomi.webp",
    "passive": "img/Chara/Skill/Skill_P_Yomi.webp"
  },
  "Yumimi": {
    "high": "img/Chara/Skill/Skill_S_Yumimi.webp",
    "low": "img/Chara/Skill/Skill_F_Yumimi.webp",
    "passive": "img/Chara/Skill/Skill_P_Yumimi.webp"
  }
});
  if (typeof globalThis !== 'undefined') globalThis.TRICKCAL_APOSTLE_SKILL_IMAGE_DATA = imageData;
  if (typeof module !== 'undefined' && module.exports) module.exports = imageData;
})();
