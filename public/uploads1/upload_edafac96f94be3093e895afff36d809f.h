//
//  array.h
//  lab6
//
//  Created by Pawel Janowiak on 19/01/15.
//  Copyright (c) 2015 Pawel Janowiak. All rights reserved.
//

#ifndef lab6_array_h
#define lab6_array_h

using namespace std;

template <class T> class Array {
private:
    T* pType;
    int mSize;
    static int NbArrays;
public:
    Array();
    Array(int);
    Array(const Array&);
    ~Array();
    int getSize();
    static int getNbArrays();
    T& operator[](size_t el) const;
    Array<T>& operator= (const Array<T> &rhs);
    friend std::ostream& operator<<(ostream &output, Array<T> &rhs);
};

/****************** Array *****************************************/

/* initializing static value */
template <class T>
int Array<T>::NbArrays = 0;

/* default constructor */
template <class T>
Array<T>::Array(): pType(NULL), mSize(0) { NbArrays++; }

/* constructor with size */
template <class T>
Array<T>::Array(int size): mSize(size) {
    pType = new T[size];
    NbArrays++;
}

template <class T>
Array<T>::Array(const Array &rhs) {
    mSize = rhs.getSize();
    pType = new T[mSize];
    for (int i=0; i<mSize; i++) {
        pType[i] = rhs[i];
    }
    NbArrays ++;
}




/* destructor */
template <class T>
Array<T>::~Array() {
    delete[] pType;
    NbArrays --;
}

/* size getter */
template <class T>
int Array<T>::getSize() { return mSize; }

/* number of all arrays getter */
template <class T>
int Array<T>::getNbArrays() { return NbArrays; }

/* overloading [] operator */
template <class T>
T& Array<T>::operator[](size_t el) const { return pType[el]; }

/* overloading = operator */
template <class T>
Array<T>& Array<T>::operator=(const Array &rhs) {
    if (&rhs == this) { return *this; } // when rhs is this example of class
    delete [] pType;
    mSize = rhs.mSize;
    pType = new T[mSize];
    for (int i=0; i<mSize; i++) {
        pType[i] = rhs[i];
    }
    return *this;
}

/* overloading << operator */
template <class T>
ostream& operator<<(ostream &output, Array<T> &rhs) {
    for (int i=0; i<rhs.mSize; i++) {
        output << "[" << i << "]=" << rhs[i] << std::endl;
        //output << rhs[i] << " ";
    }
    return output;
}
/*
 template<class T>
 ostream &operator<<(ostream& out, Array<T>& the_array)
 {
	for (int i = 0; i < the_array.get_size(); i++) out << "[" << i << "]=" << the_array[i] << endl;
	//use of[] for Array
	//use of<< for example for Animal "<<the_array[i]"
	return out;
 }
 */
/****************** Array *****************************************/
#endif
