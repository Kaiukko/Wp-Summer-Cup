import { Team, Match, Scorer, Venue, ActivityLog } from './types';

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-aqua',
    name: 'Team Aqua',
    shortName: 'TA',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKDbAyWIoOFzW74jIh4KeCpT8SVlbLpfTLqZjt-o7fedfgvGfaNu-xrmuZtrUE0vnk1NwULMRBuZEomXVlLUqq8-cHJhvhv7v5D343kjQdf4s8mAbr2127Pz-Sos75_WD-kifGbXhiXfyeqmIrP4ESBdSHVJ2lDf7F6_McAnV4aXtI6sABd9XxBYiMWmQeuITFpU5F3OlWj54d-TmMPzjbMndsBZpDU5_U5TFvfiM5g99I82u-D4_HCTYNPLIn30AJE1LGDCErasw',
    group: 'A'
  },
  {
    id: 'barracudas',
    name: 'Barracudas',
    shortName: 'BC',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0L218-EV3toZxxUNYJnbG3RjwNSiLT-pf4UzT0wZveNCcB4xHyclya5qKoLbTuNcMQ4SfIlu6huxXkLYYji3T9N9f-c2UNumRHqRYIb8jxpeCzpW6IUvxlH86WyeO51dzBc1iFfQY4LQdNbqyzEdUWbNFWXluU8irm6f7Ig7N2NLFcZTQe9JKvo0ZkAnsmKN8KS7NmASB8CwvnEvNyIkCC0GSsqPkkPCpR5KH_GxfxPVTkPabQ-VOo-hBIJ5Di_0LbAStegI6bMg',
    group: 'B'
  },
  {
    id: 'sharks-bari',
    name: 'Sharks Bari',
    shortName: 'SH',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7QYVAJR737txD_4ayh3dZw9DR52Ada0Jqis1ouJkeRoI43R1dNwzLApTG03Mw-BdRMmtrqKWCO3ac9u_43cfIo2kSmnVsR4_hbru8H2SZ_-5GLRpgJLexK-LuvTzILZVeZUrV6R_08shMlf7aQ8EPgw48XXwAfPl-Vskw8fNoqoWNF2nBMfFnYaILuRlkNFX1MN1IC3N11IqWMMwP-WXeO0p7olZ0Y5Se7UExx31ReawUDo2c1Nh5zVTj6ncLGKv6XbrCr078wQQ',
    group: 'A'
  },
  {
    id: 'poseidon',
    name: 'Poseidon Bari',
    shortName: 'PS',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvI6TG9B38bhgbyRvV1YQf1dV098P9eREFxefHFcVg1u8jf7AlwIazlWuAQlf8qyBXOCPs-3-vZ4fZUfspsjVkevxq_zlkGBPoTl1YL7MK8TkDYVfNNqUmCDNPZHgYaUoBs0cEg1q7j3JZN1bXSCTu2yM1lOa5UJTZAV-sU8tZ5GBVaIJ0HS1B6vl_6K7vMyosbXNuY-i4Y6NCihsPktiWX_Th-_DsGCC1RIi-T2eVMeTvamwEx4x6U72rUTf-Le0uHtdhoRKyKvg',
    group: 'B'
  },
  {
    id: 'titans',
    name: 'Titans Med.',
    shortName: 'TT',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuGD4zYi3OvLoOWbhxgHXIfgul7xfCNJWQcG8zwN1AcZtQtDBr4tGjl0zzSULRJK7Z5Rz4LZi_AzdTX__bFVRm3cDyKRKRTSTG2XRn_MLLSMA6AWsyCuLp0lGIDF2ZS3D8g8rFiOKxxekFHCa6JqEqZv3Nm8DrED4GhTL8hPhTqXhKC84nbrywMnjR_zrBOyUxzR08ofmduyWDoFjA-ErI8l7W6eha2aI2yXTMIT-hpF9EqqBXHiLsykN7Jdm1Z6uSPGubJMgNnb8',
    group: 'B'
  },
  {
    id: 'bari-waterpolo',
    name: 'Bari Waterpolo',
    shortName: 'BA',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDh7AwSTepgdn1oBUX-7ZxVsooUFS1-Qu2-sj1UrysNXgnd68lXMtVLQDx9TMIYOyMhayi5ndXBq0Oj0RxO92SXmkmfCRG3hROUk6RGdNdW5AYyhMYGuL6d1oNsAoVZM13rOrac0prdJJsWnDrjE9Jkt6RFDMYO9p2JdwvndMLwoIJgqyHV9d8KqLk9FO-EDLzzydP9JioapMntlk3r4QKpWFMUO60i2f-fPOIce0hYRwQW0iHopunNKMApis8iLKH-1xpU_U1rhJM',
    group: 'A'
  },
  {
    id: 'adriatic-sharks',
    name: 'Adriatic Sharks',
    shortName: 'AS',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDb7Ry5KaieiqG_A_TXgGB2VgFjq8GGA0mzbNSrnkcVtATiDgKhM1n0RwLC4i5kZrL0AmYtroc29F8vPvYGtNFtV6wzVPJVuM15QaijxWJzRK1oBvjM11eQ5UQN_CSOEVEQ5Z9Or1B6q8pVivKf6c3oRuISXUACsG5i0Rm08QToZpMshSrEWCvvCM70c6ySPU9XLyrNiMpfPv7Nl_a2Df19QKwYd-Ce8DC1eQlmtqejAYGUiZRccaYBnlh0NccCuhqA1ZH9MROq6vY',
    group: 'B'
  },
  {
    id: 'siren-wp',
    name: 'Siren WP',
    shortName: 'SW',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt4naBFr1EcOB2YZ9qbnkY-KDvR4KrfZbhEAguwSVyXH7jt6bUuYgw5ybmi3CkG8L3wxmkUFXXp7S3_ea_OpnEQ6OJk8D6kXfYFm1cIGMX7mxlRMAW_lh3N6JPWnYXYoUcXvRDCXWrnTCdH8g9ul_Xg5ihqJiCyVxH_zOpGhwPAKoD6YY7GQpe8WJi6ulvW5VKT19-bokJmEpKZhoIG1dyHcD6APuJDo-pq2MuU2CIW33bpddZE-LgvGVNk-yDniL8DAacMxuTzvk',
    group: 'A'
  },
  {
    id: 'neptune-bari',
    name: 'Neptune Bari',
    shortName: 'NP',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjONN_O5UZ0CT4eOFULBYBWgNrBtAkTl2Dq4LG8CvMmcnynz3dcazV-ha74l9VN6N9T5Pm5yxSAbrQvxDZjJLUbFlyyafggQ_L1J5vIjJwhhgzxV_5G72fChIntYhLF9YFxxCi05Qcvl3j7cay3lwQ6CDAoxFAITiMHHD14qB9PIDUEvLuIP7UFDvZGoXtuRodMNNmiXnsv5Zyo1gl6f-MkTYErT0V2UoFxgr7k6iCrmiSa13n0czuVlqT6JzA4Mc1egVkQn0tJjg',
    group: 'B'
  },
  {
    id: 'wave-runners',
    name: 'Wave Runners',
    shortName: 'WR',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqxON0bZqK_7JjJFuSRDpR1FbmEJL5fJqmZH3xRN_LZO33d5B-BF8cIYFOHbxzltlzJohyiFEx-IipFLbiNXGe54ZYAmrEjUTZLvB3dKP1rnQXxpGC_Bw65-LG3ORMrCD12Jo2iAKObYJBW7bIBI5Vo-TvBDg_TxDhi6wbgkIR571I8MRzGs236Ey1TSNK7FqeKvXGyJ6gNoBklNQO-m7Xeh_3gY4KPLxATVgO2-mFlyq6gmly4RNE2lVDqHd8fLsVa8JU9LssGMY',
    group: 'A'
  },
  {
    id: 'deep-blue',
    name: 'Deep Blue Bari',
    shortName: 'DB',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxvFjuawmqAW5jYxOxSingHppyLQUBA04d0t0sSPhyN4BECVv33T7tR7mDBDv7uvzTT0ecVV7weWp2epF9R4WH2FtCJ2Ab60FiZuKymFwRVuP3kz4hd8X8mzqeDBdc-8stn0ROmJpG-a7AwXJhz_clk9CmOABKvyrRhwf4o4RQ52RxihVjWC9E_TR-Q5lBTt3_QQ-XO3FbE9dRbZxeNltN0PJ-RxnArX7A4IcGNhya_QzU1oTZsHAuUM-iqN5Uf-kOYAw5r3pwQK8',
    group: 'A'
  },
  {
    id: 'napoli-aquatic',
    name: 'Napoli Aquatic',
    shortName: 'NA',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt4naBFr1EcOB2YZ9qbnkY-KDvR4KrfZbhEAguwSVyXH7jt6bUuYgw5ybmi3CkG8L3wxmkUFXXp7S3_ea_OpnEQ6OJk8D6kXfYFm1cIGMX7mxlRMAW_lh3N6JPWnYXYoUcXvRDCXWrnTCdH8g9ul_Xg5ihqJiCyVxH_zOpGhwPAKoD6YY7GQpe8WJi6ulvW5VKT19-bokJmEpKZhoIG1dyHcD6APuJDo-pq2MuU2CIW33bpddZE-LgvGVNk-yDniL8DAacMxuTzvk',
    group: 'A'
  },
  {
    id: 'roma-delta',
    name: 'Roma Delta',
    shortName: 'RM',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjONN_O5UZ0CT4eOFULBYBWgNrBtAkTl2Dq4LG8CvMmcnynz3dcazV-ha74l9VN6N9T5Pm5yxSAbrQvxDZjJLUbFlyyafggQ_L1J5vIjJwhhgzxV_5G72fChIntYhLF9YFxxCi05Qcvl3j7cay3lwQ6CDAoxFAITiMHHD14qB9PIDUEvLuIP7UFDvZGoXtuRodMNNmiXnsv5Zyo1gl6f-MkTYErT0V2UoFxgr7k6iCrmiSa13n0czuVlqT6JzA4Mc1egVkQn0tJjg',
    group: 'A'
  },
  {
    id: 'taranto-sharks',
    name: 'Taranto Sharks',
    shortName: 'TA',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7QYVAJR737txD_4ayh3dZw9DR52Ada0Jqis1ouJkeRoI43R1dNwzLApTG03Mw-BdRMmtrqKWCO3ac9u_43cfIo2kSmnVsR4_hbru8H2SZ_-5GLRpgJLexK-LuvTzILZVeZUrV6R_08shMlf7aQ8EPgw48XXwAfPl-Vskw8fNoqoWNF2nBMfFnYaILuRlkNFX1MN1IC3N11IqWMMwP-WXeO0p7olZ0Y5Se7UExx31ReawUDo2c1Nh5zVTj6ncLGKv6XbrCr078wQQ',
    group: 'A'
  },
  {
    id: 'salerno-tidal',
    name: 'Salerno Tidal',
    shortName: 'SA',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxvFjuawmqAW5jYxOxSingHppyLQUBA04d0t0sSPhyN4BECVv33T7tR7mDBDv7uvzTT0ecVV7weWp2epF9R4WH2FtCJ2Ab60FiZuKymFwRVuP3kz4hd8X8mzqeDBdc-8stn0ROmJpG-a7AwXJhz_clk9CmOABKvyrRhwf4o4RQ52RxihVjWC9E_TR-Q5lBTt3_QQ-XO3FbE9dRbZxeNltN0PJ-RxnArX7A4IcGNhya_QzU1oTZsHAuUM-iqN5Uf-kOYAw5r3pwQK8',
    group: 'B'
  },
  {
    id: 'catania-wave',
    name: 'Catania Wave',
    shortName: 'CT',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqxON0bZqK_7JjJFuSRDpR1FbmEJL5fJqmZH3xRN_LZO33d5B-BF8cIYFOHbxzltlzJohyiFEx-IipFLbiNXGe54ZYAmrEjUTZLvB3dKP1rnQXxpGC_Bw65-LG3ORMrCD12Jo2iAKObYJBW7bIBI5Vo-TvBDg_TxDhi6wbgkIR571I8MRzGs236Ey1TSNK7FqeKvXGyJ6gNoBklNQO-m7Xeh_3gY4KPLxATVgO2-mFlyq6gmly4RNE2lVDqHd8fLsVa8JU9LssGMY',
    group: 'B'
  },
  {
    id: 'milano-hydro',
    name: 'Milano Hydro',
    shortName: 'MI',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjONN_O5UZ0CT4eOFULBYBWgNrBtAkTl2Dq4LG8CvMmcnynz3dcazV-ha74l9VN6N9T5Pm5yxSAbrQvxDZjJLUbFlyyafggQ_L1J5vIjJwhhgzxV_5G72fChIntYhLF9YFxxCi05Qcvl3j7cay3lwQ6CDAoxFAITiMHHD14qB9PIDUEvLuIP7UFDvZGoXtuRodMNNmiXnsv5Zyo1gl6f-MkTYErT0V2UoFxgr7k6iCrmiSa13n0czuVlqT6JzA4Mc1egVkQn0tJjg',
    group: 'B'
  }
];

export const INITIAL_MATCHES: Match[] = [
  // Tappa 1 - Group A
  {
    id: 'match-1',
    stage: 'Tappa 1',
    group: 'A',
    date: 'Sabato 15 Giugno',
    time: '18:30',
    team1Id: 'team-aqua',
    team2Id: 'barracudas',
    team1Score: 12,
    team2Score: 10,
    status: 'completed',
    pitch: 'Stadio del Nuoto Bari'
  },
  {
    id: 'match-2',
    stage: 'Tappa 1',
    group: 'A',
    date: 'Sabato 15 Giugno',
    time: '20:15',
    team1Id: 'sharks-bari',
    team2Id: 'poseidon',
    team1Score: 8,
    team2Score: 11,
    status: 'completed',
    pitch: 'Molo San Nicola'
  },
  // Tappa 1 - Group B
  {
    id: 'match-3',
    stage: 'Tappa 1',
    group: 'B',
    date: 'Sabato 15 Giugno',
    time: '18:30',
    team1Id: 'poseidon',
    team2Id: 'titans',
    team1Score: 8,
    team2Score: 6,
    status: 'live',
    period: '2° Tempo',
    timeRemaining: '04:32',
    pitch: 'Pitch 1'
  },
  {
    id: 'match-4',
    stage: 'Tappa 1',
    group: 'B',
    date: 'Sabato 15 Giugno',
    time: '11:30',
    team1Id: 'bari-waterpolo',
    team2Id: 'adriatic-sharks',
    team1Score: 12,
    team2Score: 10,
    status: 'completed',
    pitch: 'Stadio del Nuoto'
  },
  {
    id: 'match-5',
    stage: 'Tappa 1',
    group: 'A',
    date: 'Sabato 15 Giugno',
    time: '15:00',
    team1Id: 'siren-wp',
    team2Id: 'neptune-bari',
    status: 'scheduled',
    pitch: 'Piscina Comunale Ruggi'
  },
  // Domenica 16 Giugno
  {
    id: 'match-6',
    stage: 'Tappa 1',
    group: 'A',
    date: 'Domenica 16 Giugno',
    time: '09:30',
    team1Id: 'wave-runners',
    team2Id: 'deep-blue',
    status: 'scheduled',
    pitch: 'Stadio del Nuoto Bari'
  },
  {
    id: 'match-7',
    stage: 'Tappa 1',
    group: 'B',
    date: 'Domenica 16 Giugno',
    time: '11:00',
    team1Id: 'milano-hydro',
    team2Id: 'catania-wave',
    status: 'scheduled',
    pitch: 'Piscina Comunale Ruggi'
  }
];

export const INITIAL_SCORERS: Scorer[] = [
  {
    id: 'scorer-1',
    name: 'Luca Moretti',
    teamId: 'bari-waterpolo',
    goals: 14,
    portraitUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAON0DLWxZrfOVSQpuvh1hEFetVljv5ZIdg8Y-gGjiGwWQQ7Mbs8C5Fq3X9_sVFUsGWHj4-_d9agG2jlfUSodSFc-7pSuvCDLLyhWyeaIO9vGH_S_5qnM26mjCwya8gq4ooafgnwlkfVvnsHCNnpo47xzY-Oo39c0ePizoIszuuf0ullTRZwvc-DF0CKEl1JckNNiQFQS77flU-PHX5vz6xVtwWogD16U0K8w-pR-8CgD3L9dSvogIIypS-eyQQoaDcI2PAvj4wUeM',
    rank: 1
  },
  {
    id: 'scorer-2',
    name: 'Marco Rossi',
    teamId: 'napoli-aquatic',
    goals: 11,
    portraitUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKDLGVaHF-O8eOOir0tYBN666UXcBuS38Z2N7LAWsTUDBIzuviAVe61eIpp4e_s4yY3AapFhts7E_DPAdazGW0wvegDVfV04t2pbMwW35uNTlqUWhXCKYPHIIdknL3sqHOxR4WfiKo4usP_b4D_qvTPIkF1x3BdEQzukXR-C18uttbF_KvTHtjvbVMUz_FDEzF8t2OiXYtqpsQiTydyjB0DCiLpg0A7KwAZL7EhaCltGaJmhpXA3EJq67xdfaJ4AfrXh84it41f2A',
    rank: 2
  },
  {
    id: 'scorer-3',
    name: 'Alessandro De Santis',
    teamId: 'salerno-tidal',
    goals: 9,
    portraitUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9OEJ_9qGuTn3lKrFFDVE0UW9EinZrd7QNnCzKqqWwYIj5aMTlOop2sadnRGUAur3-xqY8643ZNMzkakVr9nI6BkQotvuenpQlwAIVr-cpuutfnq7ic4q24TPdJPR9lG6MxDol4n62tCxcm7451TRokti3kEOoQmJZsVhyivtXgCz0sg3ZP9qnWPLlIwWslGkaM8yOXhFvM3LBI24GatXQe7K8YN_aiDVP0BrpbQs8btU7_0MotYnkaQ51choTJTg8Eq5qKV5ighw',
    rank: 3
  },
  {
    id: 'scorer-4',
    name: 'Giuseppe Bianchi',
    teamId: 'roma-delta',
    goals: 8,
    portraitUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKDLGVaHF-O8eOOir0tYBN666UXcBuS38Z2N7LAWsTUDBIzuviAVe61eIpp4e_s4yY3AapFhts7E_DPAdazGW0wvegDVfV04t2pbMwW35uNTlqUWhXCKYPHIIdknL3sqHOxR4WfiKo4usP_b4D_qvTPIkF1x3BdEQzukXR-C18uttbF_KvTHtjvbVMUz_FDEzF8t2OiXYtqpsQiTydyjB0DCiLpg0A7KwAZL7EhaCltGaJmhpXA3EJq67xdfaJ4AfrXh84it41f2A',
    rank: 4
  },
  {
    id: 'scorer-5',
    name: 'Stefano Verdi',
    teamId: 'catania-wave',
    goals: 7,
    portraitUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9OEJ_9qGuTn3lKrFFDVE0UW9EinZrd7QNnCzKqqWwYIj5aMTlOop2sadnRGUAur3-xqY8643ZNMzkakVr9nI6BkQotvuenpQlwAIVr-cpuutfnq7ic4q24TPdJPR9lG6MxDol4n62tCxcm7451TRokti3kEOoQmJZsVhyivtXgCz0sg3ZP9qnWPLlIwWslGkaM8yOXhFvM3LBI24GatXQe7K8YN_aiDVP0BrpbQs8btU7_0MotYnkaQ51choTJTg8Eq5qKV5ighw',
    rank: 5
  }
];

export const INITIAL_VENUES: Venue[] = [
  {
    id: 'venue-1',
    name: 'Stadio del Nuoto Bari',
    location: 'Via Maratona, Bari',
    capacity: '1500 POSTI',
    tags: ['OLIMPICA', 'OUTDOOR', 'PREMIUM'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMQYfxfuS7xSYFN5dDCS8WhGEpw9OIse98RI7JOyQSTzVp3nHKN3QaNHeHhDKX5kRlgC_zR3qAOXbTtmcCJsgJky0GdMwmCXcro0DfLd4JZPIvdSwmV5kt4LaILNPfGZPNSdYl-zjWpn-3GNo9zs0zQnnlZLmvOAYh6I2md9LO1kzFh9lRM5MKrXrUo8k2mxtQpSYpI0b4DP5eFAkuaJ7lkpThfaPRZIPKmlAtbU7UksMISKgVg4fOSfvVLZqCWG69E047Ua4snh4'
  },
  {
    id: 'venue-2',
    name: 'Piscina Comunale Ruggi',
    location: 'Via dello Sport, Imola',
    capacity: '500 POSTI',
    tags: ['INDOOR', 'ACADEMY'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfu3xEDsvNrXKQIkhsLSaQ4fy97GsN12JCa5wYOfCi3urzoNi0wu8D3hYRCzlXwu1naU6tAVS7GKMSkohlUk2bHrOHJZDrQrvuPdvrPQz3ecPYtZAFEM9YPC5G7ehXLGC6FkXIbik7lgoD9QyUMzoBeXzBxLK-yvl0nNdkDafhfH9NkH5O-ydipnwi4XjIr36Y0Hut5qLIvSyMSOC33vM5OSBS8QUmp0h9VOF68XrUq7hBeLA_BQaIANam1Vv5itaI7iozdAg7GKE'
  },
  {
    id: 'venue-3',
    name: 'Molo San Nicola (Sea Field)',
    location: 'Lungomare Nazario Sauro, Bari',
    capacity: 'STANDING ONLY',
    tags: ['OPEN WATER', 'EVENING'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBih8GrQURxJJobbnHerKsiQACeCHZuaZ49BGQxFgiYCggrN8272lLzUowbVu7hLVuIWngT9TNG_T3x5_GIcisJFYVEuLoRFZgoH2uL0NdV8UgKTa-DaZfWLWsH3f2FiywiokV4BPeLYBNcfTPzZNF3c37-Ryo5DCOMKjyXSjTDt6ZoVHQyfBJBmPRmmpf58p6CDvxi4iehPu6quPxoqWZDha84VNg2HFuw-xYfsJIKqfoP40oTX3tgnlk48Eev7yMwzvLO9N2Tu8M'
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    type: 'registration',
    message: 'New player registered',
    details: 'Luca Rossi - Bari Red',
    timestamp: '2m ago'
  },
  {
    id: 'log-2',
    type: 'result',
    message: 'Match result updated',
    details: 'Titans vs Sharks (8 - 6)',
    timestamp: '15m ago'
  },
  {
    id: 'log-3',
    type: 'maintenance',
    message: 'Pitch 3 maintenance',
    details: 'Flagged by Admin',
    timestamp: '1h ago'
  },
  {
    id: 'log-4',
    type: 'login',
    message: 'Admin login',
    details: 'M. Bianchi - IP: 192.168.1.52',
    timestamp: '4h ago'
  }
];
