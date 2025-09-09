module.exports = {
  apps: [
    {
      name: 'ecommerceweb',
      script: 'npm',
      args: 'run start',
      interpreter: 'none',
      cwd: '/mnt/volume_fra1_01/project.imgglobal.in/ecommercereact/website',  // Make sure this is the absolute path
      env: {
        PORT: 3000,
      },
    },
  ],
};
