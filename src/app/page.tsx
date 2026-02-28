import ChatWindow from '@/components/ChatWindow';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat - Shion AI',
  description: 'Chat with the internet, chat with Shion AI.',
};

const Home = () => {
  return <ChatWindow />;
};

export default Home;
