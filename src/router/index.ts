import { createRouter, createWebHistory } from 'vue-router'
import { nonAuthRoutes }  from "@/router/nonAuthRoutes.js";
import NonAuthenticatedLayout from '@/views/layouts/NonAuthenticatedLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '',
      name: 'Non Authenticated',
      component: NonAuthenticatedLayout,
      children: [
        ...nonAuthRoutes
      ]
    }
  ],
  /*routes: [
    {
      path: '/rsvp/vanessar',
      name: 'rsvp',
      component: RSVP,
      meta: {
        title: 'RSVP'
      }
    },
    {
      path: '/about',
      name: 'about',
      meta: {
        title: 'About Us'
      },
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/images/:name',
      name: 'Images',
      component: ImagesView,
      meta: {
        title: 'Image View'
      }
    },
    {
      path: '/view-gallery/:name',
      name: 'View Gallery',
      component: GalleryView,
      meta: {
        title: 'Image Gallery'
      }
    },
    {
      path: '/upload-image/:name',
      name: 'Upload Image',
      component: UploadImageView,
      meta: {
        title: 'Upload Image'
      }
    }
  ]*/
})

router.beforeEach((to, from, next) => {
  document.title = `Celebrate it with me - ${to.meta?.title}` || 'CWM'
  next();
});

export default router
