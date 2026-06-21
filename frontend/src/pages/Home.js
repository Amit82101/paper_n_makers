import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Gift, Sparkles } from 'lucide-react';

const Home = () => {
  const categories = [
    {
      name: 'Love & Romance',
      color: 'bg-primary/10 text-primary',
      image: 'https://images.pexels.com/photos/6708972/pexels-photo-6708972.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      occasion: 'love'
    },
    {
      name: 'Joy & Celebration',
      color: 'bg-secondary/20 text-secondary-foreground',
      image: 'https://images.unsplash.com/photo-1570378105997-1fb0e1b6a94e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwzfHxwZXJzb24lMjBob2xkaW5nJTIwZmxvd2VycyUyMGdpZnQlMjBoYXBweXxlbnwwfHx8fDE3NzM5ODAzMDF8MA&ixlib=rb-4.1.0&q=85',
      occasion: 'joy'
    },
    {
      name: 'Sympathy',
      color: 'bg-accent/20 text-foreground',
      image: 'https://images.unsplash.com/photo-1768236872781-60ec6f90d972?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHw0fHxwZXJzb24lMjBob2xkaW5nJTIwZmxvd2VycyUyMGdpZnQlMjBoYXBweXxlbnwwfHx8fDE3NzM5ODAzMDF8MA&ixlib=rb-4.1.0&q=85',
      occasion: 'sympathy'
    }
  ];

  const features = [
    {
      icon: <Heart className="w-8 h-8 text-primary" />,
      title: 'Vibrant',
      description: 'Handpicked flowers delivered daily to ensure maximum freshness'
    },
    {
      icon: <Gift className="w-8 h-8 text-secondary" />,
      title: 'Gift Messages',
      description: 'Add a personal touch with custom messages for your loved ones'
    },
    {
      icon: <Sparkles className="w-8 h-8 text-accent" />,
      title: 'Same Day Delivery',
      description: 'Choose your delivery date and time for perfect timing'
    }
  ];

  return (
    <div className="min-h-screen" data-testid="home-page">
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight leading-none mb-6">
                Say It With
                <span className="text-primary block">Flowers</span>
              </h1>
              <p className="text-lg md:text-xl leading-relaxed text-muted-foreground mb-8">
                Curated blooms for every emotion. From love to celebration, find the perfect arrangement that speaks your heart.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center space-x-2 rounded-full bg-primary text-white px-8 py-4 font-medium transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                data-testid="shop-now-button"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1760881564993-d7f6587b68d7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBob2xkaW5nJTIwZmxvd2VycyUyMGdpZnQlMjBoYXBweXxlbnwwfHx8fDE3NzM5ODAzMDF8MA&ixlib=rb-4.1.0&q=85"
                alt="Happy person holding flowers"
                className="rounded-3xl w-full h-[500px] object-cover shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-semibold tracking-tight mb-4">
              Shop By Emotion
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground max-w-2xl mx-auto">
              Every feeling deserves the perfect bloom
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/products?occasion=${category.occasion}`}
                  className="group relative overflow-hidden rounded-3xl block transition-all hover:scale-[1.02]"
                  data-testid={`category-${category.occasion}`}
                >
                  <div className="aspect-square">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                    <h3 className="text-2xl md:text-3xl font-heading font-medium text-white">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-8 border border-border shadow-sm text-center"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-2xl md:text-3xl font-heading font-medium mb-2">
                  {feature.title}
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;