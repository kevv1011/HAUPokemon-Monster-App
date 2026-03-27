import axios from 'axios';

const BASE_URL = 'http://100.109.14.85';

export const authApi = {
  login: (hunterId: string, accessKey: string) =>
    axios.post(`${BASE_URL}/login.php`, {
      username: hunterId,
      password: accessKey,
    }),
  register: (hunterId: string, accessKey: string) =>
    axios.post(`${BASE_URL}/register.php`, {
      username: hunterId,
      password: accessKey,
      player_name: hunterId,
    }),
  uploadAvatar: (hunterId: string, file: File) => {
    const formData = new FormData();
    formData.append('username', hunterId);
    formData.append('image', file);
    return axios.post(`${BASE_URL}/upload_avatar.php`, formData);
  },
  getProfile: (hunterId: string) =>
    axios.get(`${BASE_URL}/get_hunter_profile.php?username=${hunterId}`),
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
  updateMonster: (data: any) =>
    axios.post(`${BASE_URL}/update_monster.php`, data),
  deleteMonster: (id: string | number) =>
    axios.post(`${BASE_URL}/delete_monster.php`, { monster_id: id }),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return axios.post(`${BASE_URL}/upload_monster_image.php`, formData);
  },
};

export const serverApi = {
  // NOTE: These files are not in the image yet, they still need to be created!
  startServer: () => axios.post(`${BASE_URL}/start_ec2.php`),
  stopServer: () => axios.post(`${BASE_URL}/stop_ec2.php`),
  checkStatus: () => axios.get(`${BASE_URL}/status_ec2.php`),
};
