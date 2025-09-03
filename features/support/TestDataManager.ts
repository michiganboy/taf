import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { faker } from '@faker-js/faker';
import { loadTestData, TestData } from '../../utils/TestDataLoader';
import fs from 'fs';
import path from 'path';

export interface TestDataManagerContext {
  // Page objects (will be injected by Playwright fixtures)
  page?: any;
  homePage?: any;
  loginPage?: any;
  
  // Test data
  staticData: TestData;
  dynamicData: Record<string, any>;
  
  // Environment info
  env: string;
  featureName: string;
  scenarioName: string;
}

export class TestDataManager extends World implements TestDataManagerContext {
  public staticData: TestData = {};
  public dynamicData: Record<string, any> = {};
  public env: string = 'qa';
  public featureName: string = '';
  public scenarioName: string = '';
  private persistentDataFile: string;

  constructor(options: IWorldOptions) {
    super(options);
    // Create a unique file for this test run
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.persistentDataFile = path.join(process.cwd(), 'test-results', `persistent-data-${timestamp}.json`);
  }

  /**
   * Load test data for the current feature and scenario
   */
  loadTestData(scenarioKey?: string) {
    this.staticData = loadTestData(this.env, this.featureName, scenarioKey);
  }



  /**
   * Store data that persists across scenarios
   * @param key - The key to store the data under
   * @param value - The value to store
   */
  async storeData(key: string, value: any) {
    // Store in memory for immediate use (current scenario)
    this.dynamicData[key] = value;
    
    // Also persist to file for cross-scenario access
    await this.persistToFile(key, value);
  }

  /**
   * Get data value (checks memory first, then test data files, then persistent storage)
   * @param key - The key to retrieve
   * @returns The stored value
   */
  async get(key: string): Promise<any> {
    // Check memory first (current scenario)
    if (this.dynamicData[key] !== undefined) {
      return this.dynamicData[key];
    }
    
    // Check test data files (feature-specific test data)
    if (this.staticData[key] !== undefined) {
      return this.staticData[key];
    }
    
    // Check persistent storage (cross-scenario)
    return await this.getFromFile(key);
  }

  /**
   * Persist data to file for cross-scenario access
   */
  private async persistToFile(key: string, value: any) {
    try {
      // Ensure the directory exists
      const dir = path.dirname(this.persistentDataFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Read existing data or create new
      let persistentData: Record<string, any> = {};
      if (fs.existsSync(this.persistentDataFile)) {
        const fileContent = fs.readFileSync(this.persistentDataFile, 'utf8');
        persistentData = JSON.parse(fileContent);
      }

      // Add/update the key-value pair
      persistentData[key] = value;

      // Write back to file
      fs.writeFileSync(this.persistentDataFile, JSON.stringify(persistentData, null, 2));
    } catch (error) {
      console.warn(`Warning: Could not persist data for key '${key}':`, error);
    }
  }

  /**
   * Retrieve data from persistent storage
   */
  private async getFromFile(key: string): Promise<any> {
    try {
      if (fs.existsSync(this.persistentDataFile)) {
        const fileContent = fs.readFileSync(this.persistentDataFile, 'utf8');
        const persistentData = JSON.parse(fileContent);
        return persistentData[key];
      }
    } catch (error) {
      console.warn(`Warning: Could not retrieve persistent data for key '${key}':`, error);
    }
    return undefined;
  }

  /**
   * Clear persistent data (useful for cleanup)
   */
  async clearPersistentData() {
    try {
      if (fs.existsSync(this.persistentDataFile)) {
        fs.unlinkSync(this.persistentDataFile);
      }
    } catch (error) {
      console.warn('Warning: Could not clear persistent data file:', error);
    }
  }

  /**
   * Generate fake user data and optionally store it
   */
  async generateUser(store: boolean = true) {
    const user = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode()
    };

    if (store) {
      for (const [key, value] of Object.entries(user)) {
        await this.storeData(key, value);
      }
    }

    return user;
  }

  /**
   * Generate fake order data and optionally store it
   */
  async generateOrder(store: boolean = true) {
    const order = {
      orderId: faker.string.uuid(),
      items: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
        productId: faker.string.uuid(),
        productName: faker.commerce.productName(),
        quantity: faker.number.int({ min: 1, max: 10 }),
        price: parseFloat(faker.commerce.price())
      })),
      totalAmount: 0
    };

    // Calculate total
    order.totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (store) {
      await this.storeData('orderId', order.orderId);
      await this.storeData('orderItems', order.items);
      await this.storeData('totalAmount', order.totalAmount);
    }

    return order;
  }

  /**
   * Generate fake product data and optionally store it
   */
  async generateProduct(store: boolean = true) {
    const product = {
      productId: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      brand: faker.company.name()
    };

    if (store) {
      for (const [key, value] of Object.entries(product)) {
        await this.storeData(key, value);
      }
    }

    return product;
  }

  /**
   * Generate random string data
   */
  generateString(prefix: string = 'test', length: number = 8): string {
    return `${prefix}_${faker.string.alphanumeric(length)}`;
  }

  /**
   * Generate random number within range
   */
  generateNumber(min: number = 1, max: number = 100): number {
    return faker.number.int({ min, max });
  }
}

setWorldConstructor(TestDataManager);
