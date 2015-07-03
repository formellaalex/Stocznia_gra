
#ifndef lab6_animal_h
#define lab6_animal_h

using namespace std;

class Animal {
    int mWeight;
public:
    Animal();
    Animal(int);
    ~Animal();
    int getWeight() const;
    friend ostream& operator<<(std::ostream &output, Animal &rhs);
};

/****************** Animal *****************************************/

/* constructor */
Animal::Animal(int weight) {
    this->mWeight = weight;
}

/* constructor */
Animal::Animal() { }

/* destructor */
Animal::~Animal() { }

int Animal::getWeight() const {
    return this->mWeight;
}

/* output operator */
ostream& operator<<(ostream &output, Animal &rhs) {
    output << "The animal weight is: " << rhs.mWeight;
    return output;
}

/****************** Animal *****************************************/

#endif
