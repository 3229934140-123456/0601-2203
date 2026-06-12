export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/mutual-aid/index',
    'pages/activities/index',
    'pages/contacts/index',
    'pages/profile/index',
    'pages/publish-aid/index',
    'pages/aid-detail/index',
    'pages/activity-detail/index',
    'pages/create-activity/index',
    'pages/member-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '社团互助',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f8fafc'
  },
  tabBar: {
    color: '#94a3b8',
    selectedColor: '#2563eb',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/mutual-aid/index',
        text: '互助广场'
      },
      {
        pagePath: 'pages/activities/index',
        text: '活动管理'
      },
      {
        pagePath: 'pages/contacts/index',
        text: '通讯录'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
