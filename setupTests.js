import { configure } from 'enzyme';

// https://github.com/enzymejs/enzyme/issues/2462
// import Adapter from 'enzyme-adapter-react-16';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

configure({ adapter: new Adapter() });
