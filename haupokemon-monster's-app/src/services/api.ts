import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://100.109.14.85';

export const authApi = {
  login: (hunterId: string, accessKey: string) =>
    axios.post(`${BASE_URL}/login.php`, { username: hunterId, password: accessKey }),
  register: (data: any) =>
    axios.post(`${BASE_URL}/register.php`, data),
};

export const monsterApi = {
  getLeaderboard: () =>
    axios.get(`${BASE_URL}/top_monster_hunters.php`),
  logSpecimen: (data: any) =>
    axios.post(`${BASE_URL}/add_monster_catch.php`, data),
  getMonsters: () =>
    axios.get(`${BASE_URL}/get_monsters.php`),
  addMonster: (data: any) =>
    axios.post(`${BASE_URL}/add_monster.php`, data),
};

export const serverApi = {
  // NOTE: These files are not in the image yet, they still need to be created!
  startServer: () => axios.post(`${BASE_URL}/start_ec2.php`),
  stopServer: () => axios.post(`${BASE_URL}/stop_ec2.php`),
  checkStatus: () => axios.get(`${BASE_URL}/status_ec2.php`),
};
