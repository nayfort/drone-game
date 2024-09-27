import { FC } from 'react';
import { Form, Button, Input, Select } from 'antd';
import { useNavigate } from 'react-router';
import { initGame } from '../../services/gameService';

const { Option } = Select;

import './GameSetup.scss';

const GameSetup: FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: { name: string; complexity: number }) => {
    try {
      const playerId = await initGame(values.name, values.complexity);
      navigate(`/game/${playerId}`);
    } catch (error) {
      console.error('Error initializing game:', error);
    }
  };

  const [form] = Form.useForm();

  return (
    <div className="game-setup">
      <div className="game-setup__wrap">
        <h2 className="game-setup__title">Drone Game</h2>
        <Form
          layout="vertical"
          className="game-setup__form"
          form={form}
          name="gameSetup"
          onFinish={onFinish}
          initialValues={{ complexity: 0 }}
          style={{ maxWidth: 400 }}
        >
          <Form.Item
            name={'name'}
            className="game-setup__form-item"
            label="Player name:"
            rules={[{ required: true, message: 'Enter your name' }]}
          >
            <Input placeholder="Enter your name" />
          </Form.Item>
          <Form.Item
            label="Difficulty level:"
            className="game-setup__form-item"
            name="difficulty"
            rules={[
              { required: true, message: 'Choose the level of difficulty' },
              { type: 'number', min: 0, max: 10 },
            ]}
          >
            <Select placeholder="Choose the level of difficulty">
              {[...Array(11).keys()].map((level) => (
                <Option key={level} value={level}>
                  {level}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item className="game-setup__form-item">
            <Button htmlType="submit">Start</Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default GameSetup;
