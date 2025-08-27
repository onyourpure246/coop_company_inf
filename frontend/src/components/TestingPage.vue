<template>
  <div>
    <h1>Users</h1>
    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.comp_id }} ({{ user.email }})
      </li>
    </ul>
    <form @submit.prevent="addUser">
      <input v-model="newUser.name" placeholder="Name" />
      <input v-model="newUser.email" placeholder="Email" />
      <button type="submit">Add User</button>
    </form>
  </div>
</template>

<script>
import UserService from '../UserService';

export default {
  data() {
    return {
      users: [],
      newUser: {
        name: '',
        email: '',
      },
    };
  },
  methods: {
    fetchUsers() {
      UserService.getCompany()
        .then((response) => {
          this.users = response.data;
          console.log(this.users);
        })
        .catch((error) => {
          console.error('Error fetching users:', error);
        });
    }
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>
